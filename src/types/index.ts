export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type Word = {
    id: number;
    word: string;
    definition: string;
    difficulty_level: Difficulty;
};
