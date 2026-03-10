import path from 'path'
import { test, expect, Page } from '@playwright/test'
import { getPayload } from 'payload'
import { fileURLToPath } from 'url'
import config from '../../src/payload.config.js'
import { withSqliteBusyRetry } from './dbRetry'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

test.describe('Frontend', () => {
  test.describe.configure({ timeout: 120_000 })
  let page: Page
  const baseURL = 'http://localhost:3000'
  const mediaURL = `${baseURL}/admin/collections/media`
  const runId = Date.now()
  const adminEmail = `admin-${runId}@test.com`
  const adminPassword = 'admin'
  const userEmail = `user-${runId}@test.com`
  const userPassword = 'user'
  const testPaymentDetails = {
    cardNumber: '5454 5454 5454 5454',
    expiryDate: '0330',
    cvc: '737',
    postcode: 'WS11 1DB',
  }
  test.beforeAll(async ({ browser, request }, testInfo) => {
    const context = await browser.newContext()
    page = await context.newPage()
    await ensureAdminUser(adminEmail, adminPassword)
    await createUserAndLogin(request, adminEmail, adminPassword)
    await createVariantsAndProducts(page, request)
  })

  test('can go on homepage', async ({ page }) => {
    await page.goto(baseURL)

    await expect(page).toHaveTitle('Black Tech Light')

    const heading = page.locator('h1').first()

    await expect(heading).toContainText('Поставки сценического светового оборудования')
  })

  test('can sign up and subsequently login', async ({ page }) => {
    await logoutAndExpectSuccess(page)

    await page.goto(`${baseURL}/create-account`)

    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[name="password"]')
    const confirmPasswordInput = page.locator('input[name="passwordConfirm"]')
    const email = `test-${Date.now()}@test.com`
    const password = `test`

    await emailInput.fill(email)
    await passwordInput.fill(password)
    await confirmPasswordInput.fill(password)

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    const successMessage = page.locator('text=Account created successfully')
    await expect(successMessage).toBeVisible()

    await logoutAndExpectSuccess(page)
    await loginFromUI(page, email, password)
  })

  test('can add products to cart', async ({ page }) => {
    await addToCartAndConfirm(page, {
      productName: 'Test Product',
      productSlug: 'test-product',
    })
  })

  test('can add product with variant to cart', async ({ page }) => {
    await addToCartAndConfirm(page, {
      productName: 'Test Product With Variants',
      productSlug: 'test-product-variants',
      variant: 'Payload',
    })
  })

  test('can remove products from cart', async ({ page }) => {
    await addToCartAndConfirm(page, {
      productName: 'Test Product',
      productSlug: 'test-product',
    })

    await removeFromCartAndConfirm(page)
  })

  test('can remove products with variants from cart', async ({ page }) => {
    await addToCartAndConfirm(page, {
      productName: 'Test Product With Variants',
      productSlug: 'test-product-variants',
      variant: 'Payload',
    })

    await removeFromCartAndConfirm(page)
  })

  test('should retain cart content on hard refresh', async ({ page }) => {
    await addToCartAndConfirm(page, {
      productName: 'Test Product',
      productSlug: 'test-product',
    })

    await page.reload()

    const cartCount = page.locator('button[data-slot="sheet-trigger"] span').last()
    await cartCount.click()

    const productInCart = page.getByRole('dialog').getByText('Test Product')
    await expect(productInCart).toBeVisible()
  })

  test('can view and sort via shop page', async ({ page }) => {
    const sortQuery = 'SortProbeE2E'
    await page.goto(`${baseURL}/shop?q=${sortQuery}`)

    const productLinks = page.locator('article.product-shop-card > a.product-shop-card-link')
    await expect(page.locator('article.product-shop-card > a.product-shop-card-link[href="/products/sort-probe-high"]')).toHaveCount(1)
    await expect(page.locator('article.product-shop-card > a.product-shop-card-link[href="/products/sort-probe-low"]')).toHaveCount(1)

    const linksBeforeSort = await productLinks.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('href') || ''),
    )
    expect(linksBeforeSort[0]).toBe('/products/sort-probe-high')

    const priceSort = page.getByRole('link', { name: 'Цена: по возрастанию', exact: true })
    await priceSort.click()
    await expect(page).toHaveURL(new RegExp(`/shop\\?q=${sortQuery}&sort=priceInUSD`))

    const linksAfterSort = await productLinks.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('href') || ''),
    )
    expect(linksAfterSort[0]).toBe('/products/sort-probe-low')
  })

  test('authenticated users can view account', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)

    await page.goto(`${baseURL}/account`)

    const heading = page.locator('h1').first()
    await expect(heading).toHaveText('Account settings')
  })

  test('authenticated users can update their name', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)

    await page.goto(`${baseURL}/account`)

    const heading = page.locator('h1').first()
    await expect(heading).toHaveText('Account settings')

    const emailInput = page.locator('input[name="email"]')
    const nameInput = page.locator('input[name="name"]')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveValue(adminEmail)
    await expect(nameInput).toBeVisible()
    const initialName = await nameInput.inputValue()
    const newName = `${initialName || 'Test User'} ${Date.now()}`
    await nameInput.fill(newName)
    await nameInput.blur()

    const updateButton = page.getByRole('button', { name: 'Update Account' })
    await expect(updateButton).toBeEnabled({ timeout: 15_000 })

    const updateResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'PATCH' &&
        response.url().includes('/api/users/') &&
        response.ok(),
      { timeout: 30_000 },
    )

    await updateButton.click()
    await updateResponsePromise
    await expect(nameInput).toHaveValue(newName)
  })

  test('authenticated users can view orders page', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)

    await page.goto(`${baseURL}/orders`)

    const heading = page.locator('h1').first()
    await expect(heading).toHaveText('Orders')
  })

  test('authenticated users can view order details', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)
    await addToCartAndConfirm(page, {
      productName: 'Test Product',
      productSlug: 'test-product',
    })

    await checkout(page, testPaymentDetails)

    await expectOrderIsDisplayed(page)
  })

  test('authenticated customers cannot access /admin', async ({ page }) => {
    await createUserAndLogin(page.request, userEmail, userPassword, false)
    await page.goto(`${baseURL}/admin`)

    await expect(page).toHaveURL(/\/admin/)
    const bodyText = (await page.locator('body').innerText()).toLowerCase()
    expect(bodyText).toMatch(/unauthorized|not authorized|forbidden|login|войти|доступ/)
  })

  test('Guest can create and view order', async ({ page }) => {
    await logoutAndExpectSuccess(page)
    await addToCartAndConfirm(page, {
      productName: 'Test Product',
      productSlug: 'test-product',
    })

    await checkout(page, testPaymentDetails, 'guest@test.com')
    await expectOrderIsDisplayed(page)
  })

  test('Guest can view their order using /find-order', async ({ page }) => {
    await logoutAndExpectSuccess(page)
    await addToCartAndConfirm(page, {
      productName: 'Test Product',
      productSlug: 'test-product',
    })

    const guestEmail = 'guest@test.com'

    await checkout(page, testPaymentDetails, guestEmail)

    const orderHeader = await page.locator('h1.text-sm.uppercase.font-mono > span').textContent()
    const orderNumber = orderHeader?.replace(/^Order #/, '').trim()

    await page.goto(`${baseURL}/find-order`)
    const orderNumberInput = page.locator('input[name="orderID"]')
    const emailInput = page.locator('input[name="email"]')
    await orderNumberInput.fill(orderNumber || '')
    await emailInput.fill(guestEmail)

    const findOrderButton = page.getByRole('button', { name: 'Find my order' })
    await findOrderButton.click()

    await expect(orderHeader).not.toBeNull()
  })

  test('Admins can update and view prices on products', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)

    await page.goto(`${baseURL}/admin/collections/products`)
    const testProductLink = page.getByRole('link', { name: 'Test Product', exact: true })
    await testProductLink.click()

    const productDetailsButton = page.getByRole('button', { name: 'Product Details' })
    await productDetailsButton.click()

    const priceInput = page.locator('input.formattedPriceInput[placeholder="0.00"]')
    await priceInput.fill('20.00')

    await saveAndConfirmSuccess(page)
  })

  test('Admins can update and view prices on variants', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)

    await page.goto(`${baseURL}/admin/collections/variants`)
    const testProductWithVariantsLink = page.getByRole('link', {
      name: 'Test Product With Variants — Payload',
      exact: true,
    })
    await testProductWithVariantsLink.click()

    const variantPriceInput = page.locator('input.formattedPriceInput[placeholder="0.00"]').first()
    await variantPriceInput.fill('25.00')

    await saveAndConfirmSuccess(page)
  })

  test('Admins can create new products with new variants', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)

    await page.goto(`${baseURL}/admin/collections/products/create`)
    const titleInput = page.locator('input#field-title')
    await titleInput.fill('New Product with Variants')
    const slugInput = page.locator('input#field-slug')
    await slugInput.fill('new-product-with-variants')
    const chooseFromExistingButton = page.getByRole('button', { name: 'Choose from existing' })
    await chooseFromExistingButton.click()
    const firstFileButton = page.locator('button.default-cell__first-cell').first()
    await firstFileButton.click()

    const productDetailsButton = page.getByRole('button', { name: 'Product Details' })
    await productDetailsButton.click()

    const enableVariantsCheckbox = page.locator('input#field-enableVariants')
    await enableVariantsCheckbox.check()

    // create a new variant type
    const addNewVariantTypeButton = page.locator(
      'button.relationship-add-new__add-button.doc-drawer__toggler[aria-label="Add new Variant Type"]',
    )
    await addNewVariantTypeButton.click()

    const variantTypeNameInput = page.locator('input#field-name')
    await variantTypeNameInput.fill('Pattern')
    const variantTypeLabelInput = page.locator('input#field-label')
    await variantTypeLabelInput.fill('Pattern')

    const saveButton = page.getByRole('button', { name: 'Save', exact: true })
    await saveButton.click()

    // create a new variant option
    const createVariantOptionButton = page.getByRole('button', {
      name: 'Create new Variant Option',
      exact: true,
    })
    await createVariantOptionButton.click()

    const variantOptionValueInput = page.locator('input#field-value')
    await variantOptionValueInput.fill('striped')
    const variantOptionLabelInput = page
      .getByRole('dialog', { name: /variantOptions/i })
      .locator('input#field-label')
    await variantOptionLabelInput.fill('Striped')
    await saveButton.nth(1).click()

    const closeButton = page.getByRole('button', { name: 'Close' }).nth(1)
    await closeButton.click()

    const publishChangesButton = page.getByRole('button', { name: 'Publish changes' })
    await publishChangesButton.click()

    await page.goto(`${baseURL}/shop`)
    const newProductCard = page.locator(`a[href="/products/new-product-with-variants"]`).first()
    await newProductCard.waitFor({ state: 'visible' })
    await expect(newProductCard).toBeVisible()
  })

  test('Admins can view transactions and orders', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)
    await addToCartAndConfirm(page, {
      productName: 'Test Product',
      productSlug: 'test-product',
    })
    await checkout(page, testPaymentDetails)
    await expectOrderIsDisplayed(page)
    const orderHeader = await page.locator('h1.text-sm.uppercase.font-mono > span').textContent()
    const orderNumber = orderHeader?.replace(/^Order #/, '').trim()

    await page.goto(`${baseURL}/admin/collections/orders`)
    const rowCount = await page.locator('div.table table tbody tr').count()
    expect(rowCount).toBeGreaterThan(1)

    await page.goto(`${baseURL}/admin/collections/orders/${orderNumber}`)
    const product = page.locator('div.rs__control', { hasText: 'Test Product' })
    await expect(product).toBeVisible()

    await page.goto(`${baseURL}/admin/collections/transactions`)
    const transactionRows = await page.locator('div.table table tbody tr').count()
    expect(transactionRows).toBeGreaterThan(0)

    const firstRow = page.locator('td.cell-createdAt > a').first()
    await firstRow.click()

    const status = page.locator('div.rs__control', { hasText: 'Succeeded' })
    await expect(status).toBeVisible()
  })

  test('should disable add to cart when product has no inventory', async ({ page }) => {
    await page.goto(`${baseURL}/products/no-inventory-product`)
    const addToCartButton = page.getByRole('button', { name: /Добавить в заявку/i }).first()
    await expect(addToCartButton).toBeDisabled()
  })

  // This test fails, it should not let you checkout but it does
  test.skip('should fail checkout when inventory is 0', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)

    // update inventory to 1
    await page.goto(`${baseURL}/admin/collections/products`)
    const testProductLink = page.getByRole('link', { name: 'No Inventory Product', exact: true })
    await testProductLink.click()
    const productDetailsButton = page.getByRole('button', { name: 'Product Details' })
    await productDetailsButton.click()
    const inventoryInput = page.locator('input[name="inventory"]')
    await inventoryInput.fill('1')
    await saveAndConfirmSuccess(page)

    await page.goto(`${baseURL}/products/no-inventory-product`)
    const addToCartButton = page.getByRole('button', { name: /Добавить в заявку/i }).first()
    await expect(addToCartButton).toBeVisible()
    await addToCartButton.click()

    // update inventory to 0
    await page.goto(`${baseURL}/admin/collections/products`)
    await testProductLink.click()
    await productDetailsButton.click()
    await inventoryInput.fill('')
    await saveAndConfirmSuccess(page)

    await checkout(page, testPaymentDetails)
    const errorMessage = page.locator('text=This product is out of stock')
    await expect(errorMessage).toBeVisible()
  })

  async function createUserAndLogin(
    request: any,
    email: string,
    password: string,
    isAdmin: boolean = true,
  ) {
    const data: any = {
      email,
      password,
    }

    if (isAdmin) {
      data.roles = ['admin']
    }

    const createResponse = await request.post(`${baseURL}/api/users`, {
      data,
    })
    const createBody = await createResponse.json()
    if (!createResponse.ok()) {
      expect([400, 409]).toContain(createResponse.status())
      expect(JSON.stringify(createBody)).toContain('email')
    }

    const login = await request.post(`${baseURL}/api/users/login`, {
      data: {
        email,
        password,
      },
    })
    expect(login.ok()).toBeTruthy()
  }

  async function ensureAdminUser(email: string, password: string) {
    const payload = await getPayload({ config })
    const existing = await withSqliteBusyRetry(
      () =>
        payload.find({
          collection: 'users',
          limit: 1,
          where: { email: { equals: email } },
        }),
      'frontend.ensureAdminUser.findUser',
    )

    if (existing.docs.length > 0) {
      await withSqliteBusyRetry(
        () =>
          payload.update({
            collection: 'users',
            id: existing.docs[0].id,
            data: { password, roles: ['admin'] },
          }),
        'frontend.ensureAdminUser.updateUser',
      )
      return
    }

    await withSqliteBusyRetry(
      () =>
        payload.create({
          collection: 'users',
          data: { email, password, roles: ['admin'] },
        }),
      'frontend.ensureAdminUser.createUser',
    )
  }

  async function createVariantsAndProducts(page: Page, request: any) {
    const parseResponseBody = async (response: any) => {
      const raw = await response.text()

      try {
        return JSON.parse(raw)
      } catch {
        return { raw }
      }
    }

    const createProduct = async (
      data: Record<string, unknown>,
      label: string,
    ): Promise<string | number> => {
      const response = await request.post(`${baseURL}/api/products`, { data })
      const body = await parseResponseBody(response)

      expect(
        response.ok(),
        `${label} create failed: status=${response.status()} body=${JSON.stringify(body)}`,
      ).toBeTruthy()

      expect(
        body && typeof body === 'object' && 'doc' in body && body.doc?.id,
        `${label} invalid response contract: ${JSON.stringify(body)}`,
      ).toBeTruthy()

      return body.doc.id
    }

    const payload = await getPayload({ config })
    const testSlugs = [
      'test-product-variants',
      'test-product',
      'no-inventory-product',
      'sort-probe-high',
      'sort-probe-low',
    ]

    for (const slug of testSlugs) {
      await payload.delete({
        collection: 'products',
        where: {
          slug: {
            equals: slug,
          },
        },
      })
    }

    const variantType = await request.post(`${baseURL}/api/variantTypes`, {
      data: {
        name: 'brand',
        label: 'Brand',
      },
    })

    const variantTypeBody = await variantType.json()
    expect(
      variantType.ok(),
      `variantTypes create failed: ${JSON.stringify(variantTypeBody)}`,
    ).toBeTruthy()
    const variantTypeID = variantTypeBody.doc.id

    const brands = [
      { label: 'Payload', value: 'payload' },
      { label: 'Figma', value: 'figma' },
    ]

    const [payloadOptionResponse, figmaOptionResponse] = await Promise.all(
      brands.map((option) =>
        request.post(`${baseURL}/api/variantOptions`, {
          data: {
            ...option,
            variantType: variantTypeID,
          },
        }),
      ),
    )

    const payloadVariantID = (await payloadOptionResponse.json()).doc.id
    const figmaVariantID = (await figmaOptionResponse.json()).doc.id

    await loginFromUI(page, adminEmail, adminPassword)
    await page.goto(`${mediaURL}/create`)
    const fileInput = page.locator('input[type="file"]')
    const altInput = page.locator('input[name="alt"]')
    const filePath = path.resolve(dirname, '../../src/endpoints/seed/hat-logo.png')
    await fileInput.setInputFiles(filePath)
    await altInput.fill('Test Image')
    const uploadButton = page.locator('#action-save')
    await uploadButton.click()
    await expect(page).toHaveURL(/\/admin\/collections\/media\/\d+/)
    const imageMatch = page.url().match(/\/admin\/collections\/media\/(\d+)/)
    expect(imageMatch, `invalid media URL: ${page.url()}`).toBeTruthy()
    const imageID = Number(imageMatch?.[1])

    const productID = await createProduct(
      {
        brand: 'Test Product',
        model: 'With Variants',
        slug: 'test-product-variants',
        enableVariants: true,
        variantTypes: [variantTypeID],
        inventory: 100,
        _status: 'published',
        layout: [],
        gallery: [imageID],
        priceInUSDEnabled: true,
        priceInUSD: 1000,
      },
      'productWithVariants',
    )

    const variantPayload = await request.post(`${baseURL}/api/variants`, {
      data: {
        product: productID,
        variantType: variantTypeID,
        options: [payloadVariantID],
        priceInUSDEnabled: true,
        priceInUSD: 1000,
        inventory: 50,
        _status: 'published',
      },
    })

    const variantFigma = await request.post(`${baseURL}/api/variants`, {
      data: {
        product: productID,
        variantType: variantTypeID,
        options: [figmaVariantID],
        priceInUSDEnabled: true,
        priceInUSD: 1000,
        inventory: 50,
        _status: 'published',
      },
    })

    await createProduct(
      {
        brand: 'Test',
        model: 'Product',
        slug: 'test-product',
        inventory: 100,
        _status: 'published',
        layout: [],
        gallery: [imageID],
        priceInUSDEnabled: true,
        priceInUSD: 1000,
      },
      'testProduct',
    )

    await createProduct(
      {
        brand: 'No Inventory',
        model: 'Product',
        slug: 'no-inventory-product',
        inventory: 0,
        _status: 'published',
        layout: [],
        gallery: [imageID],
        priceInUSDEnabled: true,
        priceInUSD: 1000,
      },
      'noInventoryProduct',
    )

    await createProduct(
      {
        brand: 'SortProbeE2E',
        model: 'High',
        slug: 'sort-probe-high',
        inventory: 100,
        _status: 'published',
        layout: [],
        gallery: [imageID],
        priceInUSDEnabled: true,
        priceInUSD: 4000,
      },
      'sortProbeHigh',
    )

    await createProduct(
      {
        brand: 'SortProbeE2E',
        model: 'Low',
        slug: 'sort-probe-low',
        inventory: 100,
        _status: 'published',
        layout: [],
        gallery: [imageID],
        priceInUSDEnabled: true,
        priceInUSD: 100,
      },
      'sortProbeLow',
    )
  }

  async function logoutAndExpectSuccess(page: Page) {
    await page.goto(`${baseURL}/logout`)
    const heading = page.locator('h1').first()
    await expect(heading).toContainText(/logged out/i)
  }

  async function loginFromUI(page: Page, email: string, password: string) {
    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[name="password"]')
    const submitButton = page.locator('button[type="submit"]')

    await page.goto(`${baseURL}/login`)
    await emailInput.fill(email)
    await passwordInput.fill(password)
    await submitButton.click()
    await page.waitForURL(/\/account/)
  }

  async function addToCartAndConfirm(
    page: Page,
    {
      productName,
      productSlug,
      variant,
    }: {
      productName: string
      productSlug: string
      variant?: string
    },
  ) {
    await page.goto(`${baseURL}/products/${productSlug}`)
    await expect(page).toHaveURL(new RegExp(`/products/${productSlug}`))

    if (variant) {
      const variantButton = page.getByRole('button', { name: variant })
      await variantButton.waitFor({ state: 'visible' })
      await variantButton.click()
    }

    const addToCartButton = page.getByRole('button', { name: /Добавить в заявку/i }).first()
    await expect(addToCartButton).toBeVisible()
    await addToCartButton.click()

    const cartCount = page.locator('button[data-slot="sheet-trigger"] span').last()
    await expect(cartCount).toHaveText('1')
    await cartCount.click()

    const productInCart = page.getByRole('dialog').getByText(productName, { exact: false })
    await expect(productInCart).toBeVisible()
  }

  async function removeFromCartAndConfirm(page: Page) {
    const reduceQuantityButton = page.getByRole('button', { name: 'Reduce item quantity' })
    await expect(reduceQuantityButton).toBeVisible()
    await reduceQuantityButton.click()

    const emptyCartMessage = page.getByText('Ваша заявка пуста.')
    await expect(emptyCartMessage).toBeVisible()
  }

  async function checkout(
    page: Page,
    paymentDetails: {
      cardNumber: string
      expiryDate: string
      cvc: string
      postcode: string
    },
    guestEmail?: string | null,
  ): Promise<void> {
    await page.goto(`${baseURL}/checkout`)

    if (guestEmail) {
      const emailInput = page.locator('input[type="email"]')
      await emailInput.fill(guestEmail)

      const continueGuestBtn = page.getByRole('button', { name: /continue as guest/i })
      await continueGuestBtn.click()
    }

    const confirmAddress = page.getByRole('button', { name: 'Confirm address' })
    await confirmAddress.click()

    const { cardNumber, expiryDate, cvc, postcode } = paymentDetails

    const stripeIframe = page.frameLocator('iframe[title="Secure payment input frame"]')

    await stripeIframe.locator('#Field-numberInput').fill(cardNumber)
    await stripeIframe.locator('#Field-expiryInput').fill(expiryDate)
    await stripeIframe.locator('#Field-cvcInput').fill(cvc)
    await stripeIframe.locator('#Field-postalCodeInput').fill(postcode)

    const payNowButton = page.getByRole('button', { name: 'Pay now' })
    await payNowButton.click()

    await page.waitForURL(/\/orders/)
    await expect(page).toHaveURL(/\/orders/)
  }

  async function expectOrderIsDisplayed(page: Page): Promise<void> {
    const orderHeader = await page.locator('h1.text-sm.uppercase.font-mono > span').textContent()
    expect(orderHeader).toContain('Order #')

    const orderNumber = orderHeader?.replace(/^Order #/, '').trim()
    const pageURL = page.url()

    expect(pageURL).toContain(`/orders/${orderNumber}`)
  }

  async function saveAndConfirmSuccess(page: Page, collection: 'products' | 'variants' = 'products') {
    const saveButton = page.locator('#action-save')
    const saveRequest = page.waitForResponse(
      (response) =>
        response.request().method() === 'PATCH' &&
        response.url().includes(`/api/${collection}/`) &&
        response.ok(),
      { timeout: 30_000 },
    )

    await saveButton.click()
    await saveRequest
  }
})
