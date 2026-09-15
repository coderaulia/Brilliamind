import type { DiscussionComment } from '../types'

export const VANAILA_CHANNEL_INFO = {
  channelTitle: 'Vanaila Course',
  channelUrl: 'https://www.youtube.com/@VanailaCourse',
  credits:
    'Curated and structured for BrilliaMind by Vanaila Course. Original training content produced by Simon Sez IT & contributing technical educators under YouTube Standard / Creative Commons terms.',
}

export const EXCEL_DISCUSSIONS: DiscussionComment[] = [
  {
    id: 'disc-xl-1',
    authorName: 'Dimas Prasetyo',
    authorAvatar: 'DP',
    authorRole: 'Learner',
    createdAt: '3 hours ago',
    content:
      'When should I use XLOOKUP instead of VLOOKUP or INDEX/MATCH in modern Excel?',
    upvotes: 8,
    hasUpvoted: true,
    replies: [
      {
        id: 'disc-xl-1-rep',
        authorName: 'Vanaila Course',
        authorAvatar: 'VC',
        authorRole: 'Instructor',
        createdAt: '1 hour ago',
        content:
          'XLOOKUP replaces both VLOOKUP and HLOOKUP! It defaults to an exact match, looks both left and right, never breaks when inserting new columns, and provides a native 4th argument for "if_not_found" fallbacks without wrapping in IFERROR.',
        upvotes: 12,
      },
    ],
  },
  {
    id: 'disc-xl-2',
    authorName: 'Siti Rahmawati',
    authorAvatar: 'SR',
    authorRole: 'Learner',
    createdAt: 'Yesterday',
    content:
      'In Power Query (Lesson 21), why does Remove Duplicates sometimes keep the wrong record after sorting?',
    upvotes: 5,
    replies: [
      {
        id: 'disc-xl-2-rep',
        authorName: 'Vanaila Course',
        authorAvatar: 'VC',
        authorRole: 'Instructor',
        createdAt: '18 hours ago',
        content:
          'Power Query engine optimization ignores upstream sorting order during deduplication unless forced into cache memory. Wrap your sorted table step in Table.Buffer() before calling Table.Distinct() to guarantee preservation of the top row!',
        upvotes: 9,
      },
    ],
  },
]

export const SHEETS_DISCUSSIONS: DiscussionComment[] = [
  {
    id: 'disc-gs-1',
    authorName: 'Andi Wijaya',
    authorAvatar: 'AW',
    authorRole: 'Learner',
    createdAt: '5 hours ago',
    content:
      'Can I combine IMPORTRANGE with the QUERY function across multiple remote Google Spreadsheets?',
    upvotes: 7,
    hasUpvoted: true,
    replies: [
      {
        id: 'disc-gs-1-rep',
        authorName: 'Vanaila Course',
        authorAvatar: 'VC',
        authorRole: 'Instructor',
        createdAt: '2 hours ago',
        content:
          'Yes! When nesting IMPORTRANGE inside QUERY, remember to refer to columns using Col1, Col2, Col3 instead of letters A, B, C. Example: =QUERY(IMPORTRANGE("url", "Sheet1!A:Z"), "SELECT Col1, SUM(Col3) GROUP BY Col1", 1).',
        upvotes: 10,
      },
    ],
  },
  {
    id: 'disc-gs-2',
    authorName: 'Maya Lestari',
    authorAvatar: 'ML',
    authorRole: 'Learner',
    createdAt: '2 days ago',
    content:
      'How does MAP / LAMBDA compare with traditional ARRAYFORMULA in Google Sheets?',
    upvotes: 4,
    replies: [
      {
        id: 'disc-gs-2-rep',
        authorName: 'Vanaila Course',
        authorAvatar: 'VC',
        authorRole: 'Instructor',
        createdAt: 'Yesterday',
        content:
          'While ARRAYFORMULA works for basic arithmetic, LAMBDA helper functions (MAP, BYROW, SCAN) allow multi-argument logical functions like IF, AND, OR to evaluate on each row individually without flattening arrays.',
        upvotes: 7,
      },
    ],
  },
]

export const SALES_DISCUSSIONS: DiscussionComment[] = [
  {
    id: 'disc-sl-1',
    authorName: 'Bambang Kusuma',
    authorAvatar: 'BK',
    authorRole: 'Learner',
    createdAt: '4 hours ago',
    content:
      'What are the best practices for building an Executive Sales Dashboard that renders fast with 50,000+ transaction rows?',
    upvotes: 9,
    hasUpvoted: true,
    replies: [
      {
        id: 'disc-sl-1-rep',
        authorName: 'Vanaila Course',
        authorAvatar: 'VC',
        authorRole: 'Instructor',
        createdAt: '1 hour ago',
        content:
          'Load your raw data into the Excel Data Model (Power Pivot) rather than standard worksheet cells! Build DAX measures for MoM revenue and conversion ratios, and create Pivot Charts directly from the Data Model to keep file sizes small and interactions instantaneous.',
        upvotes: 14,
      },
    ],
  },
]

export const EXCEL_RESOURCES = [
  { title: 'Excel_Comprehensive_Practice_Workbook.xlsx', size: '6.4 MB', downloadUrl: '#' },
  { title: 'Excel_Formulas_&_Shortcuts_Cheatsheet.pdf', size: '1.2 MB', downloadUrl: '#' },
  { title: 'Power_Query_M_Code_Snippets_Library.txt', size: '240 KB', downloadUrl: '#' },
]

export const SHEETS_RESOURCES = [
  { title: 'Google_Sheets_Formulas_&_Query_Handbook.pdf', size: '2.1 MB', downloadUrl: '#' },
  { title: 'Spreadsheet_Automation_Templates.xlsx', size: '3.8 MB', downloadUrl: '#' },
]

export const SALES_RESOURCES = [
  { title: 'Dynamic_Sales_&_Marketing_KPI_Dashboard_Template.xlsx', size: '5.2 MB', downloadUrl: '#' },
  { title: 'Executive_Financial_Summary_Template.xlsx', size: '2.8 MB', downloadUrl: '#' },
]
