import { readFile } from 'fs/promises'
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
  const baseURL = 'http://localhost:3000'
  const runId = Date.now()
  const defaultE2EProductSlugs = [
    'test-product-variants',
    'test-product',
    'no-inventory-product',
    'sort-probe-high',
    'sort-probe-low',
  ]
  const trackedProductSlugs = new Set<string>(defaultE2EProductSlugs)
  const trackedUserEmails = new Set<string>()
  const trackedOrderIDs = new Set<number>()
  const trackedRequestIDs = new Set<number>()
  const e2eMediaAltPrefix = 'E2E Test Image'
  const sortQuery = `sort-probe-e2e-${runId}`
  const variantSelection = {
    payloadOptionID: 0,
    payloadVariantID: 0,
    typeParam: '',
  }
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
  test.beforeAll(async ({ request }) => {
    test.setTimeout(120_000)
    trackedUserEmails.add(adminEmail)
    trackedUserEmails.add(userEmail)
    await cleanupE2EData()
    await ensureAdminUser(adminEmail, adminPassword)
    await createUserAndLogin(request, adminEmail, adminPassword)
    await createVariantsAndProducts(request)
  })

  test.afterAll(async () => {
    await cleanupE2EData()
  })

  test('can go on homepage', async ({ page }) => {
    await page.goto(baseURL)

    await expect(page).toHaveTitle(/^(Главная|Black Tech Light)$/)
  })

  test('can sign up and subsequently login', async ({ page }) => {
    await logoutAndExpectSuccess(page)

    const email = `test-${Date.now()}@test.com`
    const password = `test`
    trackedUserEmails.add(email)

    const createAccount = await page.request.post(`${baseURL}/api/users`, {
      data: {
        email,
        password,
      },
    })
    expect(createAccount.ok()).toBeTruthy()

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
    await expect(page.locator('body')).toContainText('Test Product')
  })

  test('can view and sort via shop page', async ({ page }) => {
    await page.goto(`${baseURL}/shop`)

    const productLinks = page.locator('article.product-shop-card > a.product-shop-card-link')
    await expect(page.locator('article.product-shop-card > a.product-shop-card-link[href="/products/sort-probe-high"]')).toHaveCount(1)
    await expect(page.locator('article.product-shop-card > a.product-shop-card-link[href="/products/sort-probe-low"]')).toHaveCount(1)

    const linksBeforeSort = await productLinks.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('href') || ''),
    )
    expect(linksBeforeSort.indexOf('/products/sort-probe-high')).toBeGreaterThanOrEqual(0)
    expect(linksBeforeSort.indexOf('/products/sort-probe-low')).toBeGreaterThanOrEqual(0)
    expect(linksBeforeSort.indexOf('/products/sort-probe-high')).toBeLessThan(
      linksBeforeSort.indexOf('/products/sort-probe-low'),
    )

    const priceSort = page.getByRole('link', { name: 'Цена: по возрастанию', exact: true })
    await priceSort.click()
    await expect(page).toHaveURL(new RegExp(`/shop\\?sort=priceInUSD`))

    const linksAfterSort = await productLinks.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('href') || ''),
    )
    expect(linksAfterSort.indexOf('/products/sort-probe-high')).toBeGreaterThanOrEqual(0)
    expect(linksAfterSort.indexOf('/products/sort-probe-low')).toBeGreaterThanOrEqual(0)
    expect(linksAfterSort.indexOf('/products/sort-probe-low')).toBeLessThan(
      linksAfterSort.indexOf('/products/sort-probe-high'),
    )
  })

  test('authenticated users can view account', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)

    const meResponse = await page.request.get(`${baseURL}/api/users/me`)
    expect(meResponse.ok(), `users/me failed: ${meResponse.status()}`).toBeTruthy()
    const meBody = await meResponse.json()
    expect(meBody?.user?.email).toBe(adminEmail)
  })

  test('authenticated users can update their name', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)
    const meResponse = await page.request.get(`${baseURL}/api/users/me`)
    expect(meResponse.ok(), `users/me failed: ${meResponse.status()}`).toBeTruthy()
    const meBody = await meResponse.json()
    const userID = meBody?.user?.id
    expect(userID, `users/me invalid body: ${JSON.stringify(meBody)}`).toBeTruthy()
    expect(meBody?.user?.email).toBe(adminEmail)

    const initialName = meBody?.user?.name || 'Test User'
    const newName = `${initialName || 'Test User'} ${Date.now()}`
    const updateResponse = await page.request.patch(`${baseURL}/api/users/${userID}`, {
      data: {
        name: newName,
      },
    })
    expect(updateResponse.ok(), `user update failed: ${updateResponse.status()}`).toBeTruthy()

    const updatedMeResponse = await page.request.get(`${baseURL}/api/users/me`)
    expect(updatedMeResponse.ok(), `users/me refresh failed: ${updatedMeResponse.status()}`).toBeTruthy()
    const updatedMeBody = await updatedMeResponse.json()
    expect(updatedMeBody?.user?.name).toBe(newName)
  })

  test('authenticated users can view orders page', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)
    const meResponse = await page.request.get(`${baseURL}/api/users/me`)
    expect(meResponse.ok(), `users/me failed: ${meResponse.status()}`).toBeTruthy()
    const meBody = await meResponse.json()
    const userID = meBody?.user?.id
    const customerEmail = meBody?.user?.email || adminEmail
    expect(userID, `users/me invalid body: ${JSON.stringify(meBody)}`).toBeTruthy()

    const orderID = await createOrderForTest({
      customerID: userID,
      customerEmail,
    })

    const ordersResponse = await page.request.get(`${baseURL}/orders`)
    expect(ordersResponse.ok(), `orders page failed: ${ordersResponse.status()}`).toBeTruthy()
    const ordersMarkup = await ordersResponse.text()
    expect(ordersMarkup).toContain('Orders')
    expect(ordersMarkup).toContain(`#${orderID}`)
    expect(ordersMarkup).toContain(`/orders/${orderID}`)
  })

  test('authenticated users can view order details', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)
    const meResponse = await page.request.get(`${baseURL}/api/users/me`)
    expect(meResponse.ok(), `users/me failed: ${meResponse.status()}`).toBeTruthy()
    const meBody = await meResponse.json()
    const userID = meBody?.user?.id
    const userEmail = meBody?.user?.email || adminEmail
    expect(userID, `users/me invalid body: ${JSON.stringify(meBody)}`).toBeTruthy()

    const orderID = await createOrderForTest({
      customerID: userID,
      customerEmail: userEmail,
    })

    await page.goto(`${baseURL}/orders/${orderID}`)
    await expectOrderIsDisplayed(page, orderID)
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
    const guestEmail = `guest-${Date.now()}@test.com`
    const orderID = await createOrderForTest({
      customerEmail: guestEmail,
    })
    await page.goto(`${baseURL}/orders/${orderID}?email=${encodeURIComponent(guestEmail)}`)
    await expectOrderIsDisplayed(page, orderID)
  })

  test('Guest can view their order using /find-order', async ({ page }) => {
    await logoutAndExpectSuccess(page)
    const guestEmail = `guest-find-${Date.now()}@test.com`
    const orderID = await createOrderForTest({
      customerEmail: guestEmail,
    })

    await page.goto(`${baseURL}/find-order`)
    const orderNumberInput = page.locator('input[name="orderID"]')
    const emailInput = page.locator('input[name="email"]')
    await orderNumberInput.fill(String(orderID))
    await emailInput.fill(guestEmail)

    const findOrderButton = page.getByRole('button', { name: 'Find my order' })
    await findOrderButton.click()

    await expect(page).toHaveURL(new RegExp(`/orders/${orderID}\\?email=`))
    await expectOrderIsDisplayed(page, orderID)
  })

  test('Admins can update and view prices on products', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)

    await page.goto(`${baseURL}/admin/collections/products`)
    const testProductLinks = page.locator('a[href^="/admin/collections/products/"]', {
      hasText: 'Test Product',
    })
    await expect(testProductLinks.first()).toBeVisible()
    await testProductLinks.first().click()

    const priceInput = await revealPriceInput(page)
    const newPrice = buildUniquePrice(20)
    await priceInput.fill(newPrice)
    await expect(priceInput).toHaveValue(newPrice)

    await saveAndConfirmSuccess(page, 'products')
  })

  test('Admins can update and view prices on variants', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)

    await page.goto(`${baseURL}/admin/collections/variants`)
    const testProductWithVariantsLinks = page.locator('a[href^="/admin/collections/variants/"]', {
      hasText: 'Test Product With Variants — Payload',
    })
    await expect(testProductWithVariantsLinks.first()).toBeVisible()
    await testProductWithVariantsLinks.first().click()

    const variantPriceInput = page.locator('input.formattedPriceInput[placeholder="0.00"]').first()
    const newVariantPrice = buildUniquePrice(25)
    await variantPriceInput.fill(newVariantPrice)
    await expect(variantPriceInput).toHaveValue(newVariantPrice)

    await saveAndConfirmSuccess(page, 'variants')
  })

  test('Admins can create new products with new variants', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)

    const productSlug = `new-product-with-variants-${runId}`
    trackedProductSlugs.add(productSlug)
    const variantTypeResponse = await page.request.post(`${baseURL}/api/variantTypes`, {
      data: {
        name: `e2e-pattern-${runId}`,
        label: `E2E Pattern ${runId}`,
      },
    })
    expect(variantTypeResponse.ok(), `variantType create failed: ${variantTypeResponse.status()}`).toBeTruthy()
    const variantTypeBody = await variantTypeResponse.json()
    const variantTypeID = variantTypeBody?.doc?.id
    expect(variantTypeID, `variantType invalid body: ${JSON.stringify(variantTypeBody)}`).toBeTruthy()

    const variantOptionResponse = await page.request.post(`${baseURL}/api/variantOptions`, {
      data: {
        value: `e2e-striped-${runId}`,
        label: `Striped ${runId}`,
        variantType: variantTypeID,
      },
    })
    expect(variantOptionResponse.ok(), `variantOption create failed: ${variantOptionResponse.status()}`).toBeTruthy()
    const variantOptionBody = await variantOptionResponse.json()
    const variantOptionID = variantOptionBody?.doc?.id
    expect(variantOptionID, `variantOption invalid body: ${JSON.stringify(variantOptionBody)}`).toBeTruthy()

    const productResponse = await page.request.post(`${baseURL}/api/products`, {
      data: {
        brand: 'New Product',
        model: `With Variants ${runId}`,
        slug: productSlug,
        enableVariants: true,
        variantTypes: [variantTypeID],
        inventory: 100,
        _status: 'published',
        layout: [],
        priceInUSDEnabled: true,
        priceInUSD: 1000,
      },
    })
    expect(productResponse.ok(), `product create failed: ${productResponse.status()}`).toBeTruthy()
    const productBody = await productResponse.json()
    const productID = productBody?.doc?.id
    expect(productID, `product invalid body: ${JSON.stringify(productBody)}`).toBeTruthy()

    const variantResponse = await page.request.post(`${baseURL}/api/variants`, {
      data: {
        product: productID,
        variantType: variantTypeID,
        options: [variantOptionID],
        priceInUSDEnabled: true,
        priceInUSD: 1000,
        inventory: 50,
        _status: 'published',
      },
    })
    expect(variantResponse.ok(), `variant create failed: ${variantResponse.status()}`).toBeTruthy()

    await page.goto(`${baseURL}/shop`)
    const newProductCard = page.locator(`a[href="/products/${productSlug}"]`).first()
    await newProductCard.waitFor({ state: 'visible' })
    await expect(newProductCard).toBeVisible()
  })

  test('Admins can view transactions and orders', async ({ page }) => {
    await loginFromUI(page, adminEmail, adminPassword)
    const meResponse = await page.request.get(`${baseURL}/api/users/me`)
    expect(meResponse.ok(), `users/me failed: ${meResponse.status()}`).toBeTruthy()
    const meBody = await meResponse.json()
    const userID = meBody?.user?.id
    const userEmail = meBody?.user?.email || adminEmail
    expect(userID, `users/me invalid body: ${JSON.stringify(meBody)}`).toBeTruthy()

    const orderID = await createOrderForTest({
      customerID: userID,
      customerEmail: userEmail,
    })
    const transactionID = await createTransactionForTest({
      customerID: userID,
      customerEmail: userEmail,
      orderID,
      status: 'succeeded',
    })

    await page.goto(`${baseURL}/admin/collections/orders`)
    const rowCount = await page.locator('div.table table tbody tr').count()
    expect(rowCount).toBeGreaterThan(1)

    await page.goto(`${baseURL}/admin/collections/orders/${orderID}`)
    await expect(page).toHaveURL(new RegExp(`/admin/collections/orders/${orderID}`))
    await expect(page.locator('body')).toContainText('Test Product')

    await page.goto(`${baseURL}/admin/collections/transactions`)
    const transactionRows = await page.locator('div.table table tbody tr').count()
    expect(transactionRows).toBeGreaterThan(0)

    await page.goto(`${baseURL}/admin/collections/transactions/${transactionID}`)

    await expect(page).toHaveURL(new RegExp(`/admin/collections/transactions/${transactionID}`))
    await expect(page.locator('body')).toContainText('Успешно')
  })

  test('should disable add to cart when product has no inventory', async ({ page }) => {
    await page.goto(`${baseURL}/products/no-inventory-product`)
    const addToCartButton = page.getByRole('button', { name: /Добавить в заявку/i }).first()
    await expect(addToCartButton).toBeDisabled()
  })

  test('should fail checkout when inventory is 0', async ({ page }) => {
    await updateProductInventory('no-inventory-product', 1)

    await addToCartAndConfirm(page, {
      productName: 'No Inventory Product',
      productSlug: 'no-inventory-product',
    })

    await updateProductInventory('no-inventory-product', 0)

    await page.goto(`${baseURL}/checkout`)
    await expect(page.getByRole('heading', { name: 'Контактные данные' })).toBeVisible()

    const emailInput = page.locator('input[name="email"]')
    await emailInput.fill(`inventory-check-${runId}@test.com`)

    const submitRequestPromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && response.url().includes('/api/requests/submit'),
      { timeout: 30_000 },
    )

    await page.getByRole('button', { name: 'Отправить заявку' }).click()

    const submitResponse = await submitRequestPromise
    const submitBody = await submitResponse.json().catch(() => null)
    const createdRequestID =
      submitBody && typeof submitBody === 'object' && 'requestId' in submitBody
        ? Number(submitBody.requestId)
        : null

    if (typeof createdRequestID === 'number' && Number.isFinite(createdRequestID)) {
      trackedRequestIDs.add(createdRequestID)
    }

    expect(
      submitResponse.ok(),
      `Expected request submission to be rejected for out-of-stock item, got status=${submitResponse.status()} body=${JSON.stringify(submitBody)}`,
    ).toBeFalsy()
    expect(submitResponse.status()).toBe(409)
    expect(submitBody).toMatchObject({
      code: 'ITEM_UNAVAILABLE',
    })
    expect(String(submitBody?.error ?? '')).toContain('больше недоступен')
    expect(createdRequestID).toBeNull()
  })

  async function createUserAndLogin(
    request: any,
    email: string,
    password: string,
    isAdmin: boolean = true,
  ) {
    trackedUserEmails.add(email)

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

  async function createVariantsAndProducts(request: any) {
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

    const variantType = await request.post(`${baseURL}/api/variantTypes`, {
      data: {
        name: `e2e-brand-${runId}`,
        label: `E2E Brand ${runId}`,
      },
    })

    const variantTypeBody = await variantType.json()
    expect(
      variantType.ok(),
      `variantTypes create failed: ${JSON.stringify(variantTypeBody)}`,
    ).toBeTruthy()
    const variantTypeID = variantTypeBody.doc.id
    variantSelection.typeParam = `e2e-brand-${runId}`

    const brands = [
      { label: 'Payload', value: 'payload' },
      { label: 'Figma', value: 'figma' },
    ]

    const [payloadOptionResponse, figmaOptionResponse] = await Promise.all(
      brands.map((option) =>
        request.post(`${baseURL}/api/variantOptions`, {
          data: {
            ...option,
            value: `e2e-${option.value}-${runId}`,
            variantType: variantTypeID,
          },
        }),
      ),
    )

    const payloadVariantID = (await payloadOptionResponse.json()).doc.id
    const figmaVariantID = (await figmaOptionResponse.json()).doc.id
    variantSelection.payloadOptionID = Number(payloadVariantID)

    const filePath = path.resolve(dirname, '../../src/endpoints/seed/hat-logo.png')
    const mediaAlt = `${e2eMediaAltPrefix} ${runId}`
    const mediaBuffer = await readFile(filePath)
    const createMediaResponse = await request.post(`${baseURL}/api/media`, {
      multipart: {
        alt: mediaAlt,
        file: {
          name: `e2e-hat-logo-${runId}.png`,
          mimeType: 'image/png',
          buffer: mediaBuffer,
        },
      },
    })
    const createMediaBody = await parseResponseBody(createMediaResponse)
    const imageID = createMediaBody?.doc?.id

    expect(
      createMediaResponse.ok(),
      `media bootstrap failed: status=${createMediaResponse.status()} body=${JSON.stringify(createMediaBody)}`,
    ).toBeTruthy()

    expect(
      imageID,
      `media bootstrap invalid response: filePath=${filePath} alt=${mediaAlt} body=${JSON.stringify(createMediaBody)}`,
    ).toBeTruthy()

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
    const variantPayloadBody = await variantPayload.json()
    variantSelection.payloadVariantID = Number(variantPayloadBody?.doc?.id || 0)

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
        description: `${sortQuery} high`,
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
        description: `${sortQuery} low`,
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

  async function createOrderForTest({
    customerID,
    customerEmail,
    productSlug = 'test-product',
  }: {
    customerID?: number
    customerEmail?: string
    productSlug?: string
  }): Promise<number> {
    const payload = await getPayload({ config })

    const productResult = await withSqliteBusyRetry(
      () =>
        payload.find({
          collection: 'products',
          where: {
            slug: {
              equals: productSlug,
            },
          },
          limit: 1,
          overrideAccess: false,
          draft: false,
        }),
      `frontend.createOrderForTest.findProduct:${productSlug}`,
    )

    const product = productResult.docs?.[0]
    expect(product?.id, `createOrderForTest missing product: ${productSlug}`).toBeTruthy()

    const amount = typeof product?.priceInUSD === 'number' ? product.priceInUSD : 1000

    const order = await withSqliteBusyRetry(
      () =>
        payload.create({
          collection: 'orders',
          data: {
            items: [
              {
                product: product!.id,
                quantity: 1,
              },
            ],
            amount,
            currency: 'USD',
            status: 'processing',
            ...(customerID ? { customer: customerID } : {}),
            ...(customerEmail ? { customerEmail } : {}),
          },
        }),
      'frontend.createOrderForTest.createOrder',
    )

    const orderID = Number(order.id)
    trackedOrderIDs.add(orderID)

    return orderID
  }

  async function updateProductInventory(productSlug: string, inventory: number) {
    const payload = await getPayload({ config })

    const productResult = await withSqliteBusyRetry(
      () =>
        payload.find({
          collection: 'products',
          where: {
            slug: {
              equals: productSlug,
            },
          },
          limit: 1,
        }),
      `frontend.updateProductInventory.findProduct:${productSlug}`,
    )

    const product = productResult.docs?.[0]
    expect(product?.id, `updateProductInventory missing product: ${productSlug}`).toBeTruthy()

    await withSqliteBusyRetry(
      () =>
        payload.update({
          collection: 'products',
          id: product!.id,
          data: {
            inventory,
          },
        }),
      `frontend.updateProductInventory.updateProduct:${productSlug}:${inventory}`,
    )
  }

  async function createTransactionForTest({
    customerID,
    customerEmail,
    orderID,
    status = 'succeeded',
  }: {
    customerID?: number
    customerEmail?: string
    orderID?: number
    status?: 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'expired' | 'refunded'
  }): Promise<number> {
    const transaction = await withSqliteBusyRetry(
      () =>
        getPayload({ config }).then((payload) =>
          payload.create({
            collection: 'transactions',
            data: {
              currency: 'USD',
              paymentMethod: 'stripe',
              stripe: {
                customerID: `cus_${runId}`,
                paymentIntentID: `pi_${Date.now()}`,
              },
              status,
              ...(customerID ? { customer: customerID } : {}),
              ...(customerEmail ? { customerEmail } : {}),
              ...(orderID ? { order: orderID } : {}),
            },
          }),
        ),
      'frontend.createTransactionForTest.createTransaction',
    )

    return Number(transaction.id)
  }

  async function logoutAndExpectSuccess(page: Page) {
    await page.context().clearCookies()
    await page.goto(baseURL)
    await page.evaluate(() => {
      window.localStorage.clear()
      window.sessionStorage.clear()
    })
  }

  async function loginFromUI(page: Page, email: string, password: string) {
    const login = await page.request.post(`${baseURL}/api/users/login`, {
      data: {
        email,
        password,
      },
    })
    expect(login.ok()).toBeTruthy()

    await page.goto(`${baseURL}/account`)
    await page.waitForURL(/\/account/)
  }

  async function revealPriceInput(page: Page) {
    const priceInput = page.locator('input.formattedPriceInput[placeholder="0.00"]').first()
    const isPriceInputVisible = await priceInput.isVisible().catch(() => false)

    if (!isPriceInputVisible) {
      const productDetailsButton = page
        .locator(
          'button:has-text("Product Details"), button:has-text("Product details"), button:has-text("Детали товара"), button:has-text("Детали продукта"), button:has-text("Информация о продукте")',
        )
        .first()

      await expect(productDetailsButton).toBeVisible()
      await productDetailsButton.click()
    }

    await expect(priceInput).toBeVisible()
    return priceInput
  }

  function buildUniquePrice(baseWhole: number) {
    const cents = String(Date.now() % 100).padStart(2, '0')
    return `${baseWhole}.${cents}`
  }

  async function cleanupE2EData() {
    const payload = await getPayload({ config })

    const productDocs = await withSqliteBusyRetry(
      () =>
        payload.find({
          collection: 'products',
          limit: 200,
          where: {
            or: [
              { slug: { in: Array.from(trackedProductSlugs) } },
              { slug: { like: 'new-product-with-variants-%' } },
            ],
          },
        }),
      'frontend.cleanupE2EData.findProducts',
    )

    const productIDs = productDocs.docs.map((doc) => doc.id).filter(Boolean)

    if (productIDs.length > 0) {
      const requestDocsByProduct = await withSqliteBusyRetry(
        () =>
          payload.find({
            collection: 'requests',
            limit: 500,
            where: {
              'items.product': { in: productIDs },
            },
          }),
        'frontend.cleanupE2EData.findRequestsByProduct',
      )

      for (const requestDoc of requestDocsByProduct.docs) {
        await withSqliteBusyRetry(
          () => payload.delete({ collection: 'requests', id: requestDoc.id }),
          `frontend.cleanupE2EData.deleteRequestByProduct:${requestDoc.id}`,
        )
      }
    }

    const variantDocs = await withSqliteBusyRetry(
      () =>
        payload.find({
          collection: 'variants',
          limit: 500,
          where: {
            or: [
              ...(productIDs.length ? [{ product: { in: productIDs } }] : []),
              { title: { like: 'Test Product With Variants — %' } },
              { title: { like: 'New Product With Variants %' } },
            ],
          },
        }),
      'frontend.cleanupE2EData.findVariants',
    )

    for (const variant of variantDocs.docs) {
      await withSqliteBusyRetry(
        () => payload.delete({ collection: 'variants', id: variant.id }),
        `frontend.cleanupE2EData.deleteVariant:${variant.id}`,
      )
    }

    for (const product of productDocs.docs) {
      await withSqliteBusyRetry(
        () => payload.delete({ collection: 'products', id: product.id }),
        `frontend.cleanupE2EData.deleteProduct:${product.id}`,
      )
    }

    const variantOptionDocs = await withSqliteBusyRetry(
      () =>
        payload.find({
          collection: 'variantOptions',
          limit: 500,
          where: {
            or: [
              { value: { like: 'e2e-payload-%' } },
              { value: { like: 'e2e-figma-%' } },
              { value: { like: 'e2e-striped-%' } },
            ],
          },
        }),
      'frontend.cleanupE2EData.findVariantOptions',
    )

    for (const variantOption of variantOptionDocs.docs) {
      await withSqliteBusyRetry(
        () => payload.delete({ collection: 'variantOptions', id: variantOption.id }),
        `frontend.cleanupE2EData.deleteVariantOption:${variantOption.id}`,
      )
    }

    const variantTypeDocs = await withSqliteBusyRetry(
      () =>
        payload.find({
          collection: 'variantTypes',
          limit: 200,
          where: {
            or: [{ name: { like: 'e2e-brand-%' } }, { name: { like: 'e2e-pattern-%' } }],
          },
        }),
      'frontend.cleanupE2EData.findVariantTypes',
    )

    for (const variantType of variantTypeDocs.docs) {
      await withSqliteBusyRetry(
        () => payload.delete({ collection: 'variantTypes', id: variantType.id }),
        `frontend.cleanupE2EData.deleteVariantType:${variantType.id}`,
      )
    }

    const mediaDocs = await withSqliteBusyRetry(
      () =>
        payload.find({
          collection: 'media',
          limit: 200,
          where: {
            alt: { like: `${e2eMediaAltPrefix} %` },
          },
        }),
      'frontend.cleanupE2EData.findMedia',
    )

    for (const mediaDoc of mediaDocs.docs) {
      await withSqliteBusyRetry(
        () => payload.delete({ collection: 'media', id: mediaDoc.id }),
        `frontend.cleanupE2EData.deleteMedia:${mediaDoc.id}`,
      )
    }

    if (trackedOrderIDs.size > 0) {
      const orderIDs = Array.from(trackedOrderIDs)
      const transactionDocs = await withSqliteBusyRetry(
        () =>
          payload.find({
            collection: 'transactions',
            limit: 200,
            where: {
              order: { in: orderIDs },
            },
          }),
        'frontend.cleanupE2EData.findTransactions',
      )

      for (const transaction of transactionDocs.docs) {
        await withSqliteBusyRetry(
          () => payload.delete({ collection: 'transactions', id: transaction.id }),
          `frontend.cleanupE2EData.deleteTransaction:${transaction.id}`,
        )
      }

      const orderDocs = await withSqliteBusyRetry(
        () =>
          payload.find({
            collection: 'orders',
            limit: 200,
            where: {
              id: { in: orderIDs },
            },
          }),
        'frontend.cleanupE2EData.findOrders',
      )

      for (const orderDoc of orderDocs.docs) {
        await withSqliteBusyRetry(
          () => payload.delete({ collection: 'orders', id: orderDoc.id }),
          `frontend.cleanupE2EData.deleteOrder:${orderDoc.id}`,
        )
      }
    }

    if (trackedRequestIDs.size > 0) {
      const requestIDs = Array.from(trackedRequestIDs)
      const requestDocs = await withSqliteBusyRetry(
        () =>
          payload.find({
            collection: 'requests',
            limit: 200,
            where: {
              id: { in: requestIDs },
            },
          }),
        'frontend.cleanupE2EData.findRequests',
      )

      for (const requestDoc of requestDocs.docs) {
        await withSqliteBusyRetry(
          () => payload.delete({ collection: 'requests', id: requestDoc.id }),
          `frontend.cleanupE2EData.deleteRequest:${requestDoc.id}`,
        )
      }
    }

    const userEmails = Array.from(trackedUserEmails)

    if (userEmails.length > 0) {
      const userDocs = await withSqliteBusyRetry(
        () =>
          payload.find({
            collection: 'users',
            limit: 200,
            where: {
              email: { in: userEmails },
            },
          }),
        'frontend.cleanupE2EData.findUsers',
      )

      const userIDs = userDocs.docs.map((doc) => doc.id).filter(Boolean)

      if (userIDs.length > 0) {
        const cartDocs = await withSqliteBusyRetry(
          () =>
            payload.find({
              collection: 'carts',
              limit: 200,
              where: {
                customer: { in: userIDs },
              },
            }),
          'frontend.cleanupE2EData.findCarts',
        )

        for (const cartDoc of cartDocs.docs) {
          await withSqliteBusyRetry(
            () => payload.delete({ collection: 'carts', id: cartDoc.id }),
            `frontend.cleanupE2EData.deleteCart:${cartDoc.id}`,
          )
        }
      }

      for (const userDoc of userDocs.docs) {
        await withSqliteBusyRetry(
          () => payload.delete({ collection: 'users', id: userDoc.id }),
          `frontend.cleanupE2EData.deleteUser:${userDoc.id}`,
        )
      }
    }
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
    await page.context().clearCookies()
    await page.goto(baseURL)
    await page.evaluate(() => {
      window.localStorage.clear()
      window.sessionStorage.clear()
    })

    const productURL = new URL(`${baseURL}/products/${productSlug}`)

    if (variant === 'Payload' && variantSelection.typeParam && variantSelection.payloadOptionID) {
      productURL.searchParams.set(variantSelection.typeParam, String(variantSelection.payloadOptionID))
      if (variantSelection.payloadVariantID) {
        productURL.searchParams.set('variant', String(variantSelection.payloadVariantID))
      }
    }

    await page.goto(productURL.toString())
    await expect(page).toHaveURL(new RegExp(`/products/${productSlug}`))

    const variantButton = variant ? page.getByRole('button', { name: variant }).first() : null

    if (variant && variant !== 'Payload') {
      const variantButton = page.getByRole('button', { name: variant })
      await variantButton.waitFor({ state: 'visible' })
      await variantButton.click()
    }

    const addToCartButton = page.getByRole('button', { name: /Добавить в заявку/i }).first()
    const inlineQuantityInput = page.getByRole('textbox', { name: 'Количество' }).first()
    const decreaseInlineButton = page.getByRole('button', { name: 'Уменьшить количество' }).first()

    if (!(await addToCartButton.isVisible().catch(() => false))) {
      if (
        variantButton &&
        !(await inlineQuantityInput.isVisible().catch(() => false)) &&
        (await variantButton.isVisible().catch(() => false))
      ) {
        await variantButton.click()
      }

      if (await inlineQuantityInput.isVisible().catch(() => false)) {
        for (let attempt = 0; attempt < 10; attempt += 1) {
          if (await addToCartButton.isVisible().catch(() => false)) break
          const currentQuantity = Number(await inlineQuantityInput.inputValue().catch(() => '0'))
          if (!currentQuantity || currentQuantity < 1) break
          await decreaseInlineButton.click()
        }
      }
    }

    await page.waitForTimeout(500)

    const canClickAddToCart = await addToCartButton.isVisible().catch(() => false)
    const hasInlineQuantity = await inlineQuantityInput.isVisible().catch(() => false)

    if (canClickAddToCart) {
      await addToCartButton.click()
    } else if (hasInlineQuantity) {
      expect(Number(await inlineQuantityInput.inputValue())).toBeGreaterThan(0)
    }

    await expect
      .poll(
        async () => {
          if (!(await inlineQuantityInput.isVisible().catch(() => false))) return 0
          return Number(await inlineQuantityInput.inputValue().catch(() => '0'))
        },
        { timeout: 15_000 },
      )
      .toBeGreaterThan(0)

    await expect(page.locator('body')).toContainText(productName)
  }

  async function removeFromCartAndConfirm(page: Page) {
    const addToCartButton = page.getByRole('button', { name: /Добавить в заявку/i }).first()
    const inlineQuantityInput = page.getByRole('textbox', { name: 'Количество' }).first()
    const reduceQuantityButton = page.getByRole('button', { name: 'Уменьшить количество' }).first()

    await expect(inlineQuantityInput).toBeVisible()

    for (let attempt = 0; attempt < 10; attempt += 1) {
      if (await addToCartButton.isVisible().catch(() => false)) break

      const currentQuantity = Number(await inlineQuantityInput.inputValue().catch(() => '0'))
      if (!currentQuantity || currentQuantity < 1) break

      await reduceQuantityButton.click()
      await page.waitForTimeout(500)
    }

    await expect(addToCartButton).toBeVisible({ timeout: 15_000 })
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

  async function expectOrderIsDisplayed(page: Page, orderID: number): Promise<void> {
    const response = await page.request.get(page.url())
    expect(response.ok(), `order page failed: ${response.status()} url=${page.url()}`).toBeTruthy()

    const markup = await response.text()

    expect(page.url()).toContain(`/orders/${orderID}`)
    expect(markup).toContain(`Order #${orderID}`)
    expect(markup).toContain('Test Product')
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
