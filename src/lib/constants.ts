export type SortFilterItem = {
  reverse: boolean
  slug: null | string
  title: string
}

export const defaultSort: SortFilterItem = {
  slug: null,
  reverse: false,
  title: 'По алфавиту',
}

export const sorting: SortFilterItem[] = [
  defaultSort,
  { slug: '-createdAt', reverse: true, title: 'Сначала новые' },
  { slug: 'priceInUSD', reverse: false, title: 'Цена: по возрастанию' }, // asc
  { slug: '-priceInUSD', reverse: true, title: 'Цена: по убыванию' },
]
