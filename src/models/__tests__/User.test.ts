import { describe, it, expect, beforeEach, vi } from 'vitest';
import User, { IUser } from '../User';

// Mock mongoose model methods since we are unit testing logic, not DB
// However, since the methods are on the schema, we can test them by instantiating the model
// But we need to mock 'save' to avoid DB connection errors

describe('User Model Gamification', () => {
    let user: IUser;

    beforeEach(() => {
        user = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            studentProfile: {
                level: 1,
                totalXP: 0,
                achievements: [],
                streak: { current: 0, longest: 0 }
            }
        });

        // Mock save method
        user.save = vi.fn().mockResolvedValue(user);
    });

    it('should add XP and level up correctly', async () => {
        // Level 1 -> Level 2 requires 100 XP (1 * 100)
        await user.addXP(50);
        expect(user.studentProfile.totalXP).toBe(50);
        expect(user.studentProfile.level).toBe(1);

        await user.addXP(50);
        expect(user.studentProfile.totalXP).toBe(100);
        expect(user.studentProfile.level).toBe(2);
        expect(user.save).toHaveBeenCalledTimes(2);
    });

    it('should unlock achievement and grant XP', async () => {
        await user.unlockAchievement('first_lesson');

        expect(user.studentProfile.achievements).toContain('first_lesson');
        expect(user.studentProfile.totalXP).toBe(10); // first_lesson gives 10 XP
        expect(user.save).toHaveBeenCalled();
    });

    it('should not add achievement if already unlocked', async () => {
        await user.unlockAchievement('first_lesson');
        const xpAfterFirst = user.studentProfile.totalXP;

        await user.unlockAchievement('first_lesson');

        expect(user.studentProfile.achievements.length).toBe(1);
        expect(user.studentProfile.totalXP).toBe(xpAfterFirst);
    });

    it('should update streak correctly for consecutive days', async () => {
        // Mock last study date to yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        user.studentProfile.lastStudyDate = yesterday;
        user.studentProfile.streak.current = 1;

        await user.updateStreak();

        expect(user.studentProfile.streak.current).toBe(2);
        expect(user.save).toHaveBeenCalled();
    });

    it('should reset streak if missed a day', async () => {
        // Mock last study date to 2 days ago
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        user.studentProfile.lastStudyDate = twoDaysAgo;
        user.studentProfile.streak.current = 5;

        await user.updateStreak();

        expect(user.studentProfile.streak.current).toBe(1);
        expect(user.save).toHaveBeenCalled();
    });
});
