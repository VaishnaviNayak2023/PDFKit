import Fuse from 'fuse.js'
import type { Tool, ToolCategory } from '@/types'
import { TOOLS } from './registry'
import {
  CATEGORY_GRID_ORDER,
  FEATURED_TOOL_IDS,
  FILTER_CATEGORY_ORDER,
  RECENTLY_ADDED_TOOL_IDS,
  SIDEBAR_CATEGORY_ORDER,
  TOOL_CATEGORIES,
  type ToolCategoryMeta
} from './categories'

export { TOOLS } from './registry'
export {
  CATEGORY_GRID_ORDER,
  FEATURED_TOOL_IDS,
  FILTER_CATEGORY_ORDER,
  RECENTLY_ADDED_TOOL_IDS,
  SIDEBAR_CATEGORY_ORDER,
  TOOL_CATEGORIES
}
export type { ToolCategoryMeta }

const fuse = new Fuse(TOOLS, {
  includeScore: true,
  threshold: 0.38,
  ignoreLocation: true,
  keys: [
    { name: 'name', weight: 0.5 },
    { name: 'tags', weight: 0.25 },
    { name: 'description', weight: 0.15 },
    { name: 'category', weight: 0.1 }
  ]
})

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find(t => t.id === id)
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return TOOLS.filter(t => t.category === category)
}

export function getCategoryCount(category: ToolCategory): number {
  return getToolsByCategory(category).length
}

export function getFeaturedTools(): Tool[] {
  return FEATURED_TOOL_IDS
    .map(id => getToolById(id))
    .filter((tool): tool is Tool => Boolean(tool))
}

export function getPopularTools(): Tool[] {
  return TOOLS.filter(t => t.isPopular)
}

export function getNewTools(): Tool[] {
  return TOOLS.filter(t => t.isNew)
}

export function getRecentlyAddedTools(): Tool[] {
  return RECENTLY_ADDED_TOOL_IDS
    .map(id => getToolById(id))
    .filter((tool): tool is Tool => Boolean(tool))
}

export function getAvailableTools(): Tool[] {
  return TOOLS.filter(t => !t.isComingSoon)
}

export function getComingSoonTools(): Tool[] {
  return TOOLS.filter(t => t.isComingSoon)
}

export function searchTools(query: string): Tool[] {
  if (!query.trim()) return TOOLS
  return fuse.search(query.trim()).map(result => result.item)
}

export function filterTools(query: string, category: ToolCategory | 'all'): Tool[] {
  const byQuery = searchTools(query)
  if (category === 'all') return byQuery
  return byQuery.filter(tool => tool.category === category)
}

export function getRelatedTools(toolId: string): Tool[] {
  const tool = getToolById(toolId)
  if (!tool?.relatedTools) return []
  return tool.relatedTools.map(id => getToolById(id)).filter((item): item is Tool => Boolean(item))
}

export function getCategoryMeta(category: ToolCategory): ToolCategoryMeta | undefined {
  return TOOL_CATEGORIES.find(c => c.id === category)
}

export function formatToolCount(count: number, compact = false): string {
  if (compact && count >= 70) return '70+'
  return String(count)
}

export const TOOL_COUNT = TOOLS.length
export const AVAILABLE_TOOL_COUNT = TOOLS.filter(t => !t.isComingSoon).length

export interface SidebarCategoryItem {
  id: ToolCategory | 'all'
  label: string
  icon: string
  countLabel: string
  color: string
}

export function getSidebarCategories(): SidebarCategoryItem[] {
  return SIDEBAR_CATEGORY_ORDER.map(id => {
    if (id === 'all') {
      return {
        id,
        label: 'All Tools',
        icon: 'apps',
        countLabel: formatToolCount(TOOL_COUNT, true),
        color: '#4F8CFF'
      }
    }

    const meta = getCategoryMeta(id)
    return {
      id,
      label: meta?.label ?? id,
      icon: meta?.icon ?? 'extension',
      countLabel: formatToolCount(getCategoryCount(id)),
      color: meta?.color ?? '#4F8CFF'
    }
  })
}

export function getFilterCategories() {
  return FILTER_CATEGORY_ORDER.map(id => ({
    id,
    label: id === 'all' ? 'All' : (getCategoryMeta(id)?.label ?? id)
  }))
}

export function getBrowsableCategories() {
  return CATEGORY_GRID_ORDER.map(id => {
    const meta = getCategoryMeta(id)!
    return {
      ...meta,
      count: getCategoryCount(id)
    }
  })
}
