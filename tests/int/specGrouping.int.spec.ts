import { describe, expect, it } from 'vitest'

import { groupSpecificationItems } from '@/utilities/specGrouping'
import { classifySingleSpecification, detectSpecificationSectionHint } from '@/utilities/specGrouping'

const getSectionKey = (label: string, value = '') => {
  const grouped = groupSpecificationItems([{ label, value }])
  const section = grouped.find((item) =>
    item.items.some((row) => row.label === label && (value ? row.value === value : true)),
  )
  return section?.key
}

describe('spec grouping', () => {
  it('puts DMX into control section', () => {
    expect(getSectionKey('Control protocol', 'DMX512, Art-Net, sACN, RDM')).toBe(
      'controlConnections',
    )
  })

  it('puts AC 100-240V 50/60Hz into electrical section', () => {
    expect(getSectionKey('Operating Voltage', 'AC 100-240V, 50/60 Hz')).toBe('electricalPower')
  })

  it('puts IP20 into housing/mounting section', () => {
    expect(getSectionKey('Protection rate', 'IP20')).toBe('housingMountingWorkingPosition')
  })

  it('puts dimensions and weight into dimensions section', () => {
    expect(getSectionKey('Dimensions / weight', '442 x 282 x 788mm / 37.5kg')).toBe(
      'dimensionsWeight',
    )
  })

  it('uses value text when label is empty (imported bad row)', () => {
    const grouped = groupSpecificationItems([
      { label: '', value: 'Тип источника света: 330W X8 HRI Sirius Osram Arc Lamp' },
    ])
    expect(grouped[0]?.key).toBe('lightSource')
  })

  it('maps real-world rows from user list to expected sections', () => {
    const cases: Array<[string, string, string]> = [
      ['Световой поток (общий)', '41 000 лм', 'opticsPhotometry'],
      ['Подключение данных', '3-pin или 5-pin вход/выход сигнала', 'controlConnections'],
      ['Сброс (Reset)', 'с автоматической коррекцией ошибок', 'movement'],
      ['Макс. ток', '7 А / 220 В; 14 А / 110 В', 'electricalPower'],
      ['Рабочая среда', '0°C ~ 40°C', 'thermalNoiseEnvironment'],
      ['Анимационное колесо', 'непрерывное вращение в обе стороны', 'effects'],
      ['Точность', 'разрешение ±0,28° (диапазон 0,56°)', 'movement'],
      ['Совместимость', 'CloudIO', 'softwareInterface'],
      ['Работа в любом положении', '', 'housingMountingWorkingPosition'],
      ['Тепловыделение', '1845 BTU/ч ±10%', 'thermalNoiseEnvironment'],
      ['2009/125/EC', 'требования EcoDesign (ErP)', 'compliance'],
      ['cETLus Listed / cMETus Listed', '', 'compliance'],
      ['Картонная коробка + полистирол', '', 'packagingAccessories'],
      ['Флайт-кейс + пенная оболочка (2 позиции)', '', 'packagingAccessories'],
      ['Пенная оболочка', 'F21312/001 (опция)', 'packagingAccessories'],
      ['Флайт-кейс', 'CF1000F (опция)', 'packagingAccessories'],
      ['Модуль линейной призмы', '371020/803 (опция)', 'packagingAccessories'],
      ['Тип', 'PAR', 'deviceType'],
      ['Максимальная потребляемая мощность', '220 Вт', 'electricalPower'],
    ]

    for (const [label, value, expected] of cases) {
      expect(getSectionKey(label, value), `${label} | ${value}`).toBe(expected)
    }
  })

  it('maps color mixing type to color section', () => {
    expect(getSectionKey('Тип цветосмешения', 'RGBWA')).toBe('colorMixing')
  })

  it('maps fixture type to dedicated device type section', () => {
    expect(getSectionKey('Тип', 'PAR')).toBe('deviceType')
  })

  it('detects russian section heading as hint', () => {
    expect(detectSpecificationSectionHint('Гобо')).toBe('goboFraming')
  })

  it('classifies gobo dimension rows correctly even without explicit gobo word', () => {
    expect(classifySingleSpecification({ label: 'Внешний диаметр', value: '15,9 мм' })).toBe(
      'goboFraming',
    )
    expect(classifySingleSpecification({ label: 'Диаметр изображения', value: '12 мм' })).toBe(
      'goboFraming',
    )
    expect(classifySingleSpecification({ label: 'Толщина', value: '1,1 мм' })).toBe('goboFraming')
  })
})
