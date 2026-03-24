import { gql } from 'graphql-tag';
import prisma from '@/lib/prisma';

// 1. Definisi Jenis Data (TypeDefs)
export const typeDefs = gql`
  type Member {
    id: Int!
    name: String!
    email: String!
    username: String!
    role: String!
    phoneNumber: String
    address: String
    payments: [Payment!]!
    loans: [Loan!]!
    notifications: [Notification!]!
  }

  type Payment {
    id: Int!
    amount: Float!
    month: Int!
    year: Int!
    category: String!
    createdAt: String!
  }

  type Transaction {
    id: String!
    amount: Float!
    status: String!
    paymentType: String
    snapToken: String
    createdAt: String!
  }

  type Expense {
    id: Int!
    description: String!
    amount: Float!
    category: String!
    date: String!
    year: Int!
    receiptPath: String
  }

  type Loan {
    id: Int!
    amount: Float!
    totalToPay: Float!
    status: String!
    dateBorrowed: String!
    repayments: [Repayment!]!
  }

  type Repayment {
    id: Int!
    amount: Float!
    datePaid: String!
  }

  type Notification {
    id: Int!
    title: String!
    message: String!
    isRead: Boolean!
    type: String!
    createdAt: String!
  }

  type Setting {
    id: Int!
    key: String!
    value: String!
    description: String
  }

  type AuthPayload {
    token: String!
    member: Member!
  }

  type DashboardSummary {
    totalIncome: Float!
    totalExpense: Float!
    totalLoans: Float!
    balance: Float!
  }

  type Query {
    # Auth & Profile
    me(id: Int!): Member
    
    # Member Management
    getMembers(year: Int!): [Member!]!
    getMemberDetail(id: Int!): Member!
    
    # Financials
    getDashboardSummary(year: Int!): DashboardSummary!
    getAvailableYears: [Int!]!
    getExpenses(year: Int!): [Expense!]!
    getSettings: [Setting!]!
    
    # Notifications
    getMyNotifications(memberId: Int!): [Notification!]!
  }

  input MemberInput {
    name: String!
    email: String!
    username: String!
    role: String
  }

  input ExpenseInput {
    description: String!
    amount: Float!
    category: String!
    date: String!
    year: Int!
    receiptPath: String
  }

  input PaymentInput {
    memberId: Int!
    year: Int!
    months: [Int!]!
    amount: Float!
    category: String
  }

  type Mutation {
    # Auth
    login(username: String!, password: String!): AuthPayload!
    
    # Member
    addMember(input: MemberInput!): Member!
    
    # Transactions
    addPayment(input: PaymentInput!): String!
    addExpense(input: ExpenseInput!): Expense!
    deleteExpense(id: Int!): String!
    
    # Settings
    updateSetting(key: String!, value: String!): Setting!
  }
`;

// 2. Resolvers
export const resolvers = {
  Query: {
    getMembers: async (_parent: any, { year }: { year: number }) => {
      return await prisma.member.findMany({
        orderBy: { name: 'asc' },
        include: {
          payments: { where: { year } },
        },
      });
    },

    getMemberDetail: async (_parent: any, { id }: { id: number }) => {
      return await prisma.member.findUnique({
        where: { id },
        include: {
          payments: { orderBy: [{ year: 'desc' }, { month: 'asc' }] },
          loans: { include: { repayments: true } },
          notifications: { orderBy: { createdAt: 'desc' }, take: 5 }
        }
      });
    },

    getDashboardSummary: async (_parent: any, { year }: { year: number }) => {
      const filter = year === 0 ? {} : { year };

      const payments = await prisma.payment.aggregate({ _sum: { amount: true }, where: filter });
      const expenses = await prisma.expense.aggregate({ _sum: { amount: true }, where: filter });
      const loans = await prisma.loan.aggregate({ _sum: { amount: true }, where: { status: "ACTIVE" } });

      const totalIncome = payments._sum.amount || 0;
      const totalExpense = expenses._sum.amount || 0;
      const totalLoans = loans._sum.amount || 0;

      return {
        totalIncome,
        totalExpense,
        totalLoans,
        balance: totalIncome - totalExpense - totalLoans,
      };
    },

    getExpenses: async (_parent: any, { year }: { year: number }) => {
      const filter = year === 0 ? {} : { year };
      return await prisma.expense.findMany({
        where: filter,
        orderBy: { date: 'desc' },
      });
    },

    getAvailableYears: async () => {
      const paymentYears = await prisma.payment.findMany({ select: { year: true }, distinct: ['year'] });
      const uniqueYears = Array.from(new Set(paymentYears.map(p => p.year)));
      return uniqueYears.length > 0 ? uniqueYears.sort((a, b) => b - a) : [2026];
    },

    getSettings: async () => await prisma.setting.findMany(),
  },

  Mutation: {
    login: async (_parent: any, { username, password }: any) => {
      // Mencari di tabel Member (Karena User sudah dilebur ke Member)
      const member = await prisma.member.findUnique({ where: { username } });

      if (!member || member.password !== password) {
        throw new Error("Username atau password salah");
      }

      return {
        token: "session-token-" + member.id, // Implementasikan JWT di sini nanti
        member: member
      };
    },

    addMember: async (_parent: any, { input }: any) => {
      return await prisma.member.create({
        data: {
          name: input.name,
          email: input.email,
          username: input.username,
          password: "password123", // Default password
          role: input.role || "USER"
        }
      });
    },

    addPayment: async (_parent: any, { input }: any) => {
      const operations = input.months.map((m: number) => 
        prisma.payment.upsert({
          where: {
            memberId_month_year_category: {
              memberId: input.memberId,
              month: m,
              year: input.year,
              category: input.category || "IURAN_WAJIB"
            }
          },
          update: { amount: input.amount },
          create: {
            memberId: input.memberId,
            month: m,
            year: input.year,
            amount: input.amount,
            category: input.category || "IURAN_WAJIB"
          }
        })
      );
      await Promise.all(operations);
      return "Pembayaran berhasil dicatat";
    },

    addExpense: async (_parent: any, { input }: any) => {
      return await prisma.expense.create({
        data: {
          description: input.description,
          amount: input.amount,
          category: input.category,
          date: new Date(input.date).toISOString(),
          year: input.year,
          receiptPath: input.receiptPath
        },
      });
    },

    deleteExpense: async (_parent: any, { id }: { id: number }) => {
      await prisma.expense.delete({ where: { id } });
      return "Data berhasil dihapus";
    },

    updateSetting: async (_parent: any, { key, value }: any) => {
      return await prisma.setting.update({
        where: { key },
        data: { value }
      });
    }
  },
};