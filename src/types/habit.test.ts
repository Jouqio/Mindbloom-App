import { describe, it, expect } from 'vitest'
import { isExpectedDay } from './habit'

const MONDAY    = new Date('2024-01-01T12:00:00')
const WEDNESDAY = new Date('2024-01-03T12:00:00')
const FRIDAY    = new Date('2024-01-05T12:00:00')
const SATURDAY  = new Date('2024-01-06T12:00:00')
const SUNDAY    = new Date('2024-01-07T12:00:00')

describe('isExpectedDay — daily', () => {
  it('is always expected, every day of the week', () => {
    for (const d of [MONDAY, WEDNESDAY, FRIDAY, SATURDAY, SUNDAY]) {
      expect(isExpectedDay('daily', null, d)).toBe(true)
    }
  })
})

describe('isExpectedDay — weekdays', () => {
  it('is expected Monday through Friday', () => {
    expect(isExpectedDay('weekdays', null, MONDAY)).toBe(true)
    expect(isExpectedDay('weekdays', null, WEDNESDAY)).toBe(true)
    expect(isExpectedDay('weekdays', null, FRIDAY)).toBe(true)
  })
  it('is NOT expected on Saturday or Sunday', () => {
    expect(isExpectedDay('weekdays', null, SATURDAY)).toBe(false)
    expect(isExpectedDay('weekdays', null, SUNDAY)).toBe(false)
  })
})

describe('isExpectedDay — weekends', () => {
  it('is expected Saturday and Sunday', () => {
    expect(isExpectedDay('weekends', null, SATURDAY)).toBe(true)
    expect(isExpectedDay('weekends', null, SUNDAY)).toBe(true)
  })
  it('is NOT expected Monday through Friday', () => {
    expect(isExpectedDay('weekends', null, MONDAY)).toBe(false)
    expect(isExpectedDay('weekends', null, WEDNESDAY)).toBe(false)
    expect(isExpectedDay('weekends', null, FRIDAY)).toBe(false)
  })
})

describe('isExpectedDay — custom', () => {
  it('is expected only on the exact days listed (0=Sunday..6=Saturday)', () => {
    const mwf = [1, 3, 5]
    expect(isExpectedDay('custom', mwf, MONDAY)).toBe(true)
    expect(isExpectedDay('custom', mwf, WEDNESDAY)).toBe(true)
    expect(isExpectedDay('custom', mwf, FRIDAY)).toBe(true)
    expect(isExpectedDay('custom', mwf, SATURDAY)).toBe(false)
    expect(isExpectedDay('custom', mwf, SUNDAY)).toBe(false)
  })
  it('safely returns false (not throws) when customDays is null', () => {
    expect(() => isExpectedDay('custom', null, MONDAY)).not.toThrow()
    expect(isExpectedDay('custom', null, MONDAY)).toBe(false)
  })
  it('safely returns false when customDays is an empty array', () => {
    expect(isExpectedDay('custom', [], MONDAY)).toBe(false)
  })
})

describe('isExpectedDay — defaults to "now" when no date is passed', () => {
  it('does not throw when called with only 2 arguments', () => {
    expect(() => isExpectedDay('daily', null)).not.toThrow()
  })
})
