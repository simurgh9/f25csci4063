<h1 align="center">CSCI 4063 Senior Capstone (Fall 2025)</h1>

# Updates

## Week 1

- Reviewed Syllabus
- Met and discussed different ideas

## Meeting 1

- Started a git repository
- Picked the spoiler app idea

## Meeting 2

- Ollama container
- Transcript data website: https://transcripts.foreverdreaming.org/viewforum.php?f=1662
- Meeting Notes: Organize project using MVC format, start drafting Project Proposal

## Meeting 3

- Basic Forever Dreaming Transcripts scraper
- MVC implementation
- Proposal progress
- Meeting Notes: Contact Dreaming Transcripts about use of their data,
  bring scraped data to show next time, continue working on proposal

## Meeting 4

- Similarity confidence calculation for statement given a transcript
- Simple RAG
- Text chunking and embedding

## Meeting 5

- Clean unused files (the ones from when tashfeen created the repo.)
- Describe where your database lives and give a simple SQL (if using
  SQL) query to query it. For example, to get the recommendations based on a users id, 
  ```SQL
  -- FIXETH MOI!!
  WITH user_shows AS (
    SELECT "showId"
    FROM user_shows_show
    WHERE "userId" = 1
  ),
  user_subs AS (
    SELECT s."showId",
           e.id   AS "currentEpisodeId",
           e.season,
           e.episode
    FROM subscription_info s
    LEFT JOIN episode e ON s."currentEpisodeId" = e.id
    WHERE s."userId" = 1
  )
  SELECT
    p.id                         AS post_id,
    p.content                    AS post_content,
    p."createdAt"                AS post_created_at,
  
    jsonb_build_object(
      'id', sh.id,
      'title', sh.title
    ) AS show,
  
    (
      SELECT jsonb_agg(
               jsonb_build_object(
                 'id', e.id,
                 'season', e.season,
                 'episode', e.episode,
                 'title', e.title
               ) ORDER BY e.season, e.episode
             )
      FROM episode e
      WHERE e."showId" = sh.id
    ) AS show_episodes,
  
    (
      SELECT jsonb_build_object(
               'showId', us."showId",
               'currentEpisodeId', us."currentEpisodeId",
               'season', us.season,
               'episode', us.episode
             )
      FROM user_subs us
      WHERE us."showId" = p."showId"
      LIMIT 1
    ) AS user_progress,
  
    (
      SELECT jsonb_agg(
               jsonb_build_object(
                 'id', c.id,
                 'index', c.index,
                 'text', c.text,
                 'episodeId', c."episodeId",
                 'embedding', c.embedding::text
               ) ORDER BY c.index
             )
      FROM chunk c
      JOIN episode e2 ON c."episodeId" = e2.id
      WHERE e2."showId" = sh.id
    ) AS chunks_for_show
  
  FROM post p
  JOIN show sh ON p."showId" = sh.id
  WHERE p."showId" IN (SELECT "showId" FROM user_shows)
    AND p."createdAt" < '2025-10-30T20:00:00Z'::timestamptz
  ORDER BY p."createdAt" DESC
  LIMIT 5;

  ```

  set the userId, cursor, and limit 

  getting all the users, posts, and shows is as simple as 

  ```SQL
  SELECT * FROM "user"; 
  ```

  just change user to what entity you want! 

### Pre-Project

- Define: Retrieveal-Augmented Generation.
- Ask Haley (Because Tashfeen spoke to them during the meeting on October
  1, 2025).

## Proposal

[PDF](docs/proposal/proposal.pdf)

## Meeting 6

- Backend demo
- Getting post recommendations based on position in series through curl request

## Meeting 7

- Basic frontend for showing post based on position in series (just post content and show title)
- Font and styling discussion

## Meeting 8

<!-- - Write bullet notes here. -->

## Meeting 9

<!-- - Write bullet notes here. -->

## Meeting 10

<!-- - Write bullet notes here. -->

## Final Report

[PDF](docs/final/report.pdf)

## Presentation

[PDF](docs/presentation/presentation.pdf)

# License

Copyright (C) 2025 Beauchamp, Seaman, Tashfeen

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
