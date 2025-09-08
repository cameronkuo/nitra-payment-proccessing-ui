import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

const breakpoints = useBreakpoints(breakpointsTailwind)

export default function () {
  return {
    xs: breakpoints.smaller('sm'),
    sm: breakpoints.greaterOrEqual('sm'),
    md: breakpoints.greaterOrEqual('md'),
    lg: breakpoints.greaterOrEqual('lg'),
    xl: breakpoints.greaterOrEqual('xl'),
    xxl: breakpoints.greaterOrEqual('2xl')
  }
}