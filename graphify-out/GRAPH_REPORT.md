# Graph Report - D:\MTech\Semester 4\SystemDesignRecommenderApp  (2026-04-20)

## Corpus Check
- 70 files · ~45,153 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 228 nodes · 223 edges · 58 communities detected
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]

## God Nodes (most connected - your core abstractions)
1. `scrape_and_build()` - 13 edges
2. `McpClient` - 11 edges
3. `SystemDesignService` - 9 edges
4. `KBBuilder` - 7 edges
5. `LLMExtractor` - 7 edges
6. `WebScraper` - 7 edges
7. `ISystemDesignService` - 6 edges
8. `Module 4: Run Knowledge Pipeline     End-to-end pipeline: Scrape -> Chunk -> Ext` - 6 edges
9. `VectorIndexer` - 6 edges
10. `ContentChunker` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Module 4: Run Knowledge Pipeline     End-to-end pipeline: Scrape -> Chunk -> Ext` --uses--> `VectorIndexer`  [INFERRED]
  D:\MTech\Semester 4\SystemDesignRecommenderApp\rag-engine\main.py → D:\MTech\Semester 4\SystemDesignRecommenderApp\rag-engine\src\indexer\indexer.py
- `scrape_and_build()` --calls--> `WebScraper`  [INFERRED]
  D:\MTech\Semester 4\SystemDesignRecommenderApp\rag-engine\main.py → D:\MTech\Semester 4\SystemDesignRecommenderApp\rag-engine\src\scraper\scraper.py
- `scrape_and_build()` --calls--> `ContentChunker`  [INFERRED]
  D:\MTech\Semester 4\SystemDesignRecommenderApp\rag-engine\main.py → D:\MTech\Semester 4\SystemDesignRecommenderApp\rag-engine\src\scraper\chunker.py
- `scrape_and_build()` --calls--> `LLMExtractor`  [INFERRED]
  D:\MTech\Semester 4\SystemDesignRecommenderApp\rag-engine\main.py → D:\MTech\Semester 4\SystemDesignRecommenderApp\rag-engine\src\extractor\llm_extractor.py
- `scrape_and_build()` --calls--> `KBBuilder`  [INFERRED]
  D:\MTech\Semester 4\SystemDesignRecommenderApp\rag-engine\main.py → D:\MTech\Semester 4\SystemDesignRecommenderApp\rag-engine\src\extractor\kb_builder.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (17): ContentChunker, Takes a list of dicts with 'title' and 'content' keys.         Chunks the conten, Module 2: Content Chunker     Prepares scraped content for LLM processing.     C, KBBuilder, Formats a list into a markdown bulleted list., Creates a markdown file for the given technology under its category folder., Module 4: Knowledge Base Builder     Stores structured decision knowledge for RA, LLMExtractor (+9 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (6): ControllerBase, IRuleEngineService, ISystemDesignService, RuleEngineService, SystemDesignController, SystemDesignService

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (6): AwsDocsController, SystemDesignRecommenderApi.Controllers, IAsyncDisposable, McpClient, McpRequest, SystemDesignRecommenderApi.Clients

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (7): IOllamaChatService, OllamaChatController, SystemDesignRecommenderApi.Controllers, OllamaChatService, SystemDesignRecommenderApi.Services, handleSubmit(), SettingsController

### Community 4 - "Community 4"
Cohesion: 0.25
Nodes (2): DesignSessionDTO, ISystemDesignService

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (4): Module 5: Vector Indexer     Reads extracted knowledge (Markdown) and builds a s, Loads all markdown files from the knowledge base and indexes them., VectorIndexer, main()

### Community 6 - "Community 6"
Cohesion: 0.38
Nodes (5): BaseModel, DesignContext, DesignRequirements, format_docs(), generate_rag_design()

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (3): ISettingsService, handleSave(), SettingsService

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (3): InitialCreate, SystemDesignRecommenderApi.Domain.Data.Migrations, Migration

### Community 9 - "Community 9"
Cohesion: 0.4
Nodes (3): DesignDbContextModelSnapshot, SystemDesignRecommenderApi.Domain.Data.Migrations, ModelSnapshot

### Community 10 - "Community 10"
Cohesion: 0.4
Nodes (2): IOllamaChatService, SystemDesignRecommenderApi.Services

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (2): DbContext, DesignDbContext

### Community 12 - "Community 12"
Cohesion: 0.5
Nodes (3): RecommendationResult, RequirementRecord, RuleTriggerRecord

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (2): InitialCreate, SystemDesignRecommenderApi.Domain.Data.Migrations

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (2): IRuleEngineService, RuleTriggerRecordDTO

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (1): ISettingsService

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (3): has_meaningful_content(), Check if the knowledge base markdown file already has real extracted content., run_ingestion()

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (2): ArchComponent, ArchitectureDesign

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (2): DesignContext, DesignRequirements

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (1): Scraper module for Architecture Decision Intelligence System

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (1): DesignSession

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (1): Team

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (1): User

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (1): SystemDesignRecommenderApi.Domain.DTO

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (1): SystemDesignRequestDto

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (1): AppSettings

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (1): McpRequest

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **39 isolated node(s):** `SystemDesignRecommenderApi.Clients`, `McpRequest`, `SystemDesignRecommenderApi.Controllers`, `SystemDesignRecommenderApi.Controllers`, `DesignSession` (+34 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 21`** (2 nodes): `DesignSession.cs`, `DesignSession`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `Team.cs`, `Team`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `User.cs`, `User`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `SystemDesignRecommenderApi.Domain.DTO`, `ChatRequestDTO.cs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `SystemDesignRequestDto.cs`, `SystemDesignRequestDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `AppSettings`, `AppSettings.cs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `McpMessage.cs`, `McpRequest`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `page.tsx`, `DashboardPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `page.tsx`, `GetStartedPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `page.tsx`, `RecommendationsPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (2 nodes): `page.tsx`, `TeamsPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (2 nodes): `Footer.tsx`, `Footer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (2 nodes): `Navbar.tsx`, `handleScroll()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (2 nodes): `ManagementForms.tsx`, `onSubmit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (2 nodes): `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `Program.cs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `SystemDesignRecommenderApi.AssemblyInfo.cs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `SystemDesignRecommenderApi.GlobalUsings.g.cs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `SystemDesignRecommenderApi.MvcApplicationPartsAssemblyInfo.cs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `mockData.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `base.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `Dashboard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `RecommendationsView.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `TeamComponents.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `TeamsView.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `UserDetailDialog.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (1 nodes): `useSystemDesignStore.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (1 nodes): `useTeamStore.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `form.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (1 nodes): `recommendation.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (1 nodes): `team.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `OllamaChatController` connect `Community 3` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Why does `AwsDocsController` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `scrape_and_build()` connect `Community 0` to `Community 5`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `scrape_and_build()` (e.g. with `WebScraper` and `.fetch_page()`) actually correct?**
  _`scrape_and_build()` has 10 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `KBBuilder` (e.g. with `Module 4: Run Knowledge Pipeline     End-to-end pipeline: Scrape -> Chunk -> Ext` and `scrape_and_build()`) actually correct?**
  _`KBBuilder` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `LLMExtractor` (e.g. with `Module 4: Run Knowledge Pipeline     End-to-end pipeline: Scrape -> Chunk -> Ext` and `scrape_and_build()`) actually correct?**
  _`LLMExtractor` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SystemDesignRecommenderApi.Clients`, `McpRequest`, `SystemDesignRecommenderApi.Controllers` to the rest of the system?**
  _39 weakly-connected nodes found - possible documentation gaps or missing edges._