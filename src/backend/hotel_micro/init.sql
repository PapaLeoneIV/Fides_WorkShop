CREATE TABLE "Bikes" (
    "id" TEXT NOT NULL,
    "to" VARCHAR(255) NOT NULL,
    "from" VARCHAR(255) NOT NULL,
    CONSTRAINT "Bikes_pkey" PRIMARY KEY ("id")
);

-- Insert sample data
INSERT INTO "Bikes" ("id", "road", "dirt") VALUES
('1', 5000, 690);
