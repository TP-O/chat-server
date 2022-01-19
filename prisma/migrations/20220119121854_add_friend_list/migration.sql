/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `locked_actions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `players` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `players` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "friend_relationship_types" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "friend_relationship_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend_relationships" (
    "id" BIGSERIAL NOT NULL,
    "first_player_id" BIGINT NOT NULL,
    "second_player_id" BIGINT NOT NULL,
    "relationship_type_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friend_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "friend_relationship_types_name_key" ON "friend_relationship_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "friend_relationships_first_player_id_second_player_id_key" ON "friend_relationships"("first_player_id", "second_player_id");

-- CreateIndex
CREATE UNIQUE INDEX "locked_actions_name_key" ON "locked_actions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "players_username_key" ON "players"("username");

-- CreateIndex
CREATE UNIQUE INDEX "players_email_key" ON "players"("email");

-- AddForeignKey
ALTER TABLE "friend_relationships" ADD CONSTRAINT "friend_relationships_first_player_id_fkey" FOREIGN KEY ("first_player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_relationships" ADD CONSTRAINT "friend_relationships_second_player_id_fkey" FOREIGN KEY ("second_player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_relationships" ADD CONSTRAINT "friend_relationships_relationship_type_id_fkey" FOREIGN KEY ("relationship_type_id") REFERENCES "friend_relationship_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
