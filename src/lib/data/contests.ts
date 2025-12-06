import { prisma } from '@/lib/prisma';
import { ContestStatus } from '@prisma/client';

export interface ContestWithEntries {
  id: string;
  title: string;
  prizeDescription: string;
  totalSlots: number;
  slotPrice: number;
  status: ContestStatus;
  creatorId: string;
  threadId: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  winnerId: string | null;
  creator?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  entriesCount?: number;
  slotsSold?: number;
}

export interface ContestEntryWithUser {
  id: string;
  contestId: string;
  participantId: string;
  isWinner: boolean;
  entryFeePaid: number;
  enteredAt: Date;
  participant?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

/**
 * Get all contests for a creator
 */
export async function getCreatorContests(creatorId: string): Promise<ContestWithEntries[]> {
  const contests = await prisma.contest.findMany({
    where: {
      creatorId
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      _count: {
        select: {
          entries: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return contests.map(contest => ({
    id: contest.id,
    title: contest.title,
    prizeDescription: contest.prizeDescription,
    totalSlots: contest.totalSlots,
    slotPrice: contest.slotPrice,
    status: contest.status,
    creatorId: contest.creatorId,
    threadId: contest.threadId,
    createdAt: contest.createdAt,
    updatedAt: contest.updatedAt,
    resolvedAt: contest.resolvedAt,
    winnerId: contest.winnerId,
    creator: contest.creator ? {
      id: contest.creator.id,
      name: contest.creator.name,
      image: contest.creator.image
    } : undefined,
    entriesCount: contest._count.entries,
    slotsSold: contest._count.entries
  }));
}

/**
 * Get a single contest with entries
 */
export async function getContestById(contestId: string): Promise<ContestWithEntries | null> {
  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      _count: {
        select: {
          entries: true
        }
      }
    }
  });

  if (!contest) return null;

  return {
    id: contest.id,
    title: contest.title,
    prizeDescription: contest.prizeDescription,
    totalSlots: contest.totalSlots,
    slotPrice: contest.slotPrice,
    status: contest.status,
    creatorId: contest.creatorId,
    threadId: contest.threadId,
    createdAt: contest.createdAt,
    updatedAt: contest.updatedAt,
    resolvedAt: contest.resolvedAt,
    winnerId: contest.winnerId,
    creator: contest.creator ? {
      id: contest.creator.id,
      name: contest.creator.name,
      image: contest.creator.image
    } : undefined,
    entriesCount: contest._count.entries,
    slotsSold: contest._count.entries
  };
}

/**
 * Get contests for a specific thread
 */
export async function getContestsByThread(threadId: string): Promise<ContestWithEntries[]> {
  const contests = await prisma.contest.findMany({
    where: {
      threadId,
      status: 'OPEN'
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      _count: {
        select: {
          entries: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return contests.map(contest => ({
    id: contest.id,
    title: contest.title,
    prizeDescription: contest.prizeDescription,
    totalSlots: contest.totalSlots,
    slotPrice: contest.slotPrice,
    status: contest.status,
    creatorId: contest.creatorId,
    threadId: contest.threadId,
    createdAt: contest.createdAt,
    updatedAt: contest.updatedAt,
    resolvedAt: contest.resolvedAt,
    winnerId: contest.winnerId,
    creator: contest.creator ? {
      id: contest.creator.id,
      name: contest.creator.name,
      image: contest.creator.image
    } : undefined,
    entriesCount: contest._count.entries,
    slotsSold: contest._count.entries
  }));
}

/**
 * Get contests for a specific creator (for profile page)
 */
export async function getContestsByCreator(creatorId: string, limit: number = 5): Promise<ContestWithEntries[]> {
  const contests = await prisma.contest.findMany({
    where: {
      creatorId,
      status: 'OPEN'
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      _count: {
        select: {
          entries: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });

  return contests.map(contest => ({
    id: contest.id,
    title: contest.title,
    prizeDescription: contest.prizeDescription,
    totalSlots: contest.totalSlots,
    slotPrice: contest.slotPrice,
    status: contest.status,
    creatorId: contest.creatorId,
    threadId: contest.threadId,
    createdAt: contest.createdAt,
    updatedAt: contest.updatedAt,
    resolvedAt: contest.resolvedAt,
    winnerId: contest.winnerId,
    creator: contest.creator ? {
      id: contest.creator.id,
      name: contest.creator.name,
      image: contest.creator.image
    } : undefined,
    entriesCount: contest._count.entries,
    slotsSold: contest._count.entries
  }));
}

