import { useEffect, useLayoutEffect } from 'react'

/**
 * useLayoutEffect on the client, useEffect on the server.
 * Prevents SSR warnings while maintaining synchronous DOM reads.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect
