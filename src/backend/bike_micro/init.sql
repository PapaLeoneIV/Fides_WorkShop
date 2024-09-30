CREATE TABLE "bikes" (
    "id" TEXT NOT NULL,
    "road" INTEGER NOT NULL,
    "dirt" INTEGER NOT NULL,
    CONSTRAINT "bikes_pkey" PRIMARY KEY ("id")
);

-- Insert sample data
INSERT INTO "bikes" ("id", "road", "dirt") VALUES
('1', 5000, 6969);
