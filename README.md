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


  Post is probably the most useful entity, and this is how you query for them. 

  ```SQL
  SELECT id, content, showId, userId, createdAt FROM "post"; 
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

- Updated so user state is maintained between pages

## Meeting 9

- Updated to display all posts from a specific user
- Added ability to create post

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
