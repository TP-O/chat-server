-- CreateTable
CREATE TABLE "players" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(20) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "password" VARCHAR(64),
    "email_verified_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_access_tokens" (
    "id" SERIAL NOT NULL,
    "tokenable_type" VARCHAR(255) NOT NULL,
    "tokenable_id" INTEGER NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "abilities" TEXT NOT NULL,
    "last_used_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personal_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locked_actions" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locked_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locks" (
    "id" SERIAL NOT NULL,
    "player_id" INTEGER NOT NULL,
    "action_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "expired_at" TIMESTAMP(0) NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend_relationship_types" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "friend_relationship_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend_relationships" (
    "id" SERIAL NOT NULL,
    "first_player_id" INTEGER NOT NULL,
    "second_player_id" INTEGER NOT NULL,
    "relationship_type_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friend_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_status" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(25) NOT NULL,

    CONSTRAINT "player_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_states" (
    "id" SERIAL NOT NULL,
    "player_id" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,
    "socket_id" VARCHAR(25),
    "status_updated_at" TIMESTAMP(0),

    CONSTRAINT "player_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_username_key" ON "players"("username");

-- CreateIndex
CREATE UNIQUE INDEX "players_email_key" ON "players"("email");

-- CreateIndex
CREATE UNIQUE INDEX "locked_actions_name_key" ON "locked_actions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "locks_player_id_action_id_key" ON "locks"("player_id", "action_id");

-- CreateIndex
CREATE UNIQUE INDEX "friend_relationship_types_name_key" ON "friend_relationship_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "friend_relationships_first_player_id_second_player_id_key" ON "friend_relationships"("first_player_id", "second_player_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_status_name_key" ON "player_status"("name");

-- CreateIndex
CREATE UNIQUE INDEX "player_states_player_id_key" ON "player_states"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_states_socket_id_key" ON "player_states"("socket_id");

-- AddForeignKey
ALTER TABLE "locks" ADD CONSTRAINT "locks_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locks" ADD CONSTRAINT "locks_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "locked_actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_relationships" ADD CONSTRAINT "friend_relationships_first_player_id_fkey" FOREIGN KEY ("first_player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_relationships" ADD CONSTRAINT "friend_relationships_second_player_id_fkey" FOREIGN KEY ("second_player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_relationships" ADD CONSTRAINT "friend_relationships_relationship_type_id_fkey" FOREIGN KEY ("relationship_type_id") REFERENCES "friend_relationship_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_states" ADD CONSTRAINT "player_states_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_states" ADD CONSTRAINT "player_states_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "player_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
