export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type Word = {
    word: string;
    definition: string;
    difficulty_level: Difficulty;
};
