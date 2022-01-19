import { PrismaClient } from '@prisma/client';

export async function seedFriendRelationship(client: PrismaClient) {
  return client.friendRelationship.createMany({
    data: [
      // Friends of id-1 player
      {
        first_player_id: 1,
        second_player_id: 2,
        relationship_type_id: 1,
      },
      {
        first_player_id: 1,
        second_player_id: 3,
        relationship_type_id: 2,
      },
      {
        first_player_id: 1,
        second_player_id: 4,
        relationship_type_id: 2,
      },
      {
        first_player_id: 1,
        second_player_id: 5,
        relationship_type_id: 1,
      },
      {
        first_player_id: 1,
        second_player_id: 6,
        relationship_type_id: 2,
      },
      // Friends of id-2 player
      {
        first_player_id: 2,
        second_player_id: 3,
        relationship_type_id: 1,
      },
      {
        first_player_id: 2,
        second_player_id: 4,
        relationship_type_id: 2,
      },
      {
        first_player_id: 2,
        second_player_id: 5,
        relationship_type_id: 2,
      },
      {
        first_player_id: 2,
        second_player_id: 6,
        relationship_type_id: 2,
      },
      {
        first_player_id: 2,
        second_player_id: 7,
        relationship_type_id: 1,
      },
    ],
  });
}
