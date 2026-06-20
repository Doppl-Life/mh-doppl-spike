// Neo4j projection generated from the portable knowledge.jsonl ledger.
// The ledger remains the durable substrate; this is a query/read projection.
CREATE CONSTRAINT knowledge_record_id IF NOT EXISTS FOR (r:KnowledgeRecord) REQUIRE r.id IS UNIQUE;
CREATE CONSTRAINT case_id IF NOT EXISTS FOR (c:Case) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT tag_id IF NOT EXISTS FOR (t:Tag) REQUIRE t.id IS UNIQUE;
CREATE CONSTRAINT source_id IF NOT EXISTS FOR (s:Source) REQUIRE s.id IS UNIQUE;

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_013d66ad76779d55"})
  SET r.kind = "signal", r.text = "Figures are real/cited but applied to a forward projection; the municipal-fine dependency is drawn at its *concentrated* edge (fine-reliant towns) and flagged, not overstated as a macro line.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_013d66ad76779d55"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_013d66ad76779d55"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_013d66ad76779d55"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_0770e6e35816d3df"})
  SET r.kind = "hidden_variable", r.text = "That visibility is exactly why this is worth a dedicated case \u2014 not to stop at the obvious, but to take the obvious and press it for **breadth then depth**: what is the *full* web of institutions that exists because humans crash, and then, for each, what is the second- and third-order effect of removing the crash that almost no one is pricing?", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_0770e6e35816d3df"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_0770e6e35816d3df"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "crash"}) SET t.name = "crash";
MATCH (r:KnowledgeRecord {id: "ks_0770e6e35816d3df"}), (t:Tag {id: "crash"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_0770e6e35816d3df"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"})
  SET r.kind = "warning", r.text = "Sibling to the accident > economy (A, harm), mobility & time (B), and the ownership unwind (D); governed by > the adoption-asymmetry lens.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "accident"}) SET t.name = "accident";
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (t:Tag {id: "accident"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "economy"}) SET t.name = "economy";
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (t:Tag {id: "economy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "mobility"}) SET t.name = "mobility";
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (t:Tag {id: "mobility"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "ownership"}) SET t.name = "ownership";
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (t:Tag {id: "ownership"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "sibling"}) SET t.name = "sibling";
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (t:Tag {id: "sibling"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_1e6e46b941caf62e"})
  SET r.kind = "signal", r.text = "Signal sources (cited in the with-solution file and `../sources.md` Signal Set D6): NHTSA crash counts/cost; US Treasury FIO + IBISWorld on the auto-insurance pool; AutoInsurance.com / AM Best on insurer ad spend; SRTR / trauma-donor literature on organ supply.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_1e6e46b941caf62e"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_1e6e46b941caf62e"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "crash"}) SET t.name = "crash";
MATCH (r:KnowledgeRecord {id: "ks_1e6e46b941caf62e"}), (t:Tag {id: "crash"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_1e6e46b941caf62e"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_24a61e27c77ae552"})
  SET r.kind = "case_frame", r.text = "# Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock) > **Doppl subtype:** `zeitgeist_synthesis` (see `../subtype-index.md`).", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_24a61e27c77ae552"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_24a61e27c77ae552"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_24a61e27c77ae552"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_24a61e27c77ae552"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_24a61e27c77ae552"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "mobility"}) SET t.name = "mobility";
MATCH (r:KnowledgeRecord {id: "ks_24a61e27c77ae552"}), (t:Tag {id: "mobility"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_24a61e27c77ae552"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_3939f5a0799cd8bc"})
  SET r.kind = "hidden_variable", r.text = "Ask the system to recover the actual problem (removal of the *enforcement/compliance substrate*, not \"fewer tickets\"), map the web (breadth), game out the non-obvious second/third-order effects (depth) \u2014 including the state's revenue-replacement fight \u2014 and synthesize what it converges to.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_3939f5a0799cd8bc"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_3939f5a0799cd8bc"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "enforcement"}) SET t.name = "enforcement";
MATCH (r:KnowledgeRecord {id: "ks_3939f5a0799cd8bc"}), (t:Tag {id: "enforcement"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_3939f5a0799cd8bc"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "substrate"}) SET t.name = "substrate";
MATCH (r:KnowledgeRecord {id: "ks_3939f5a0799cd8bc"}), (t:Tag {id: "substrate"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_48afd4e078f132d4"})
  SET r.kind = "case_frame", r.text = "When you remove the driver and the cost/friction of distance, a single convergence fires across travel, work, and geography.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_48afd4e078f132d4"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_48afd4e078f132d4"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_48afd4e078f132d4"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_48afd4e078f132d4"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "travel"}) SET t.name = "travel";
MATCH (r:KnowledgeRecord {id: "ks_48afd4e078f132d4"}), (t:Tag {id: "travel"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_5823561ddc53b2c9"})
  SET r.kind = "claim", r.text = "Five years ago there was no credible removal of the crash; five years out the unwind is consensus.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_5823561ddc53b2c9"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_5823561ddc53b2c9"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "crash"}) SET t.name = "crash";
MATCH (r:KnowledgeRecord {id: "ks_5823561ddc53b2c9"}), (t:Tag {id: "crash"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_5823561ddc53b2c9"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_58a24eaeebb5f84c"})
  SET r.kind = "signal", r.text = "## Source Notes - Synthetic case built from public reporting; the thesis is an analytical projection for use as an eval fixture, not an audited forecast.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_58a24eaeebb5f84c"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_58a24eaeebb5f84c"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_58a24eaeebb5f84c"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_5a5e11078530985e"})
  SET r.kind = "signal", r.text = "partial), a **$175\u2013200B/yr** industry, each often the **largest taxpayer/employer** in its town.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_5a5e11078530985e"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_5a5e11078530985e"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_5a5e11078530985e"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"})
  SET r.kind = "warning", r.text = "These read like separate topics but they are **chapters of one story** \u2014 different forces acting on the same puck \u2014 so this case holds them together and asks: *what does it all add up to?* (The sibling story, **Sub-cluster A \u2014 the accident economy**, removes a *different* substrate, the crash; it is `fsd-accident-economy`, not part of this case.) **Chapter 1 \u2014 door-to-door travel (the 200\u2013700-mile band).** The obvious travel story is \"robotaxis in cities.\" The fertile one is *intercity*: autonomy collapses **door-to-door** travel economics in the band where the existing system is already weakest.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "accident"}) SET t.name = "accident";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "accident"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "cluster"}) SET t.name = "cluster";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "cluster"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "crash"}) SET t.name = "crash";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "crash"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "economy"}) SET t.name = "economy";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "economy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "sibling"}) SET t.name = "sibling";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "sibling"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "substrate"}) SET t.name = "substrate";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "substrate"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "travel"}) SET t.name = "travel";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "travel"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_5d4e25516970c8bf"})
  SET r.kind = "case_frame", r.text = "> **Cluster:** this is **Sub-cluster B** of the `full-self-driving-unlock` family > \u2014 the \"mobility & time\" convergence (\"perfect Pepsis\" \u2014 see > `../zeitgeist-synthesis-notes.md`).", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_5d4e25516970c8bf"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_5d4e25516970c8bf"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "cluster"}) SET t.name = "cluster";
MATCH (r:KnowledgeRecord {id: "ks_5d4e25516970c8bf"}), (t:Tag {id: "cluster"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_5d4e25516970c8bf"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "mobility"}) SET t.name = "mobility";
MATCH (r:KnowledgeRecord {id: "ks_5d4e25516970c8bf"}), (t:Tag {id: "mobility"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_5d4e25516970c8bf"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_5e2dec158c8d0cc5"})
  SET r.kind = "case_frame", r.text = "This is `zeitgeist_synthesis` because the timing is load-bearing: the trigger is autonomy crossing to deployment (see the umbrella `full-self-driving-unlock` case) colliding with a short-haul air system already in secular decline and a commute/work pattern reverting to pre-pandemic norms.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_5e2dec158c8d0cc5"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_5e2dec158c8d0cc5"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_5e2dec158c8d0cc5"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_5e2dec158c8d0cc5"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_5fb704a2bef3e119"})
  SET r.kind = "signal", r.text = "Signal sources (cited in the with-solution file and `../sources.md` Signal Set D7): Brookings / NPR / BTS on short-haul share and decline; ERAU on car dominance and the short-haul-vs-autonomous-mobility modal choice; Valor Flights on the 3-hour door-to-door rule (Brightline West); BLS on driver employment; NATSO on the travel-center industry; Census ACS on commute time.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_5fb704a2bef3e119"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_5fb704a2bef3e119"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_5fb704a2bef3e119"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_5fb704a2bef3e119"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_5fb704a2bef3e119"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_6c3edd9f72be7f5b"})
  SET r.kind = "claim", r.text = "And the deep edges are where it gets strange: auto insurers are among the largest advertisers in America (so ad-supported media is partly funded by the crash), and trauma deaths are a declining but disproportionately *high-quality* source of donor organs (so removing young crash victims tightens the best part of the transplant supply).", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_6c3edd9f72be7f5b"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_6c3edd9f72be7f5b"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "crash"}) SET t.name = "crash";
MATCH (r:KnowledgeRecord {id: "ks_6c3edd9f72be7f5b"}), (t:Tag {id: "crash"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_6c3edd9f72be7f5b"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_6d8ee52ab9d817f7"})
  SET r.kind = "case_frame", r.text = "Chapter 2 \u2014 labor + reclaimed time (the supply/work side).** Driving is also a *job* and a *tax on time*.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_6d8ee52ab9d817f7"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_6d8ee52ab9d817f7"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_6d8ee52ab9d817f7"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_6d8ee52ab9d817f7"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_7a95906b90ef92b9"})
  SET r.kind = "signal", r.text = "## Source Notes - Synthetic case built from public reporting; the thesis is an analytical projection for use as an eval fixture, not an audited forecast.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_7a95906b90ef92b9"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_7a95906b90ef92b9"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_7a95906b90ef92b9"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_7b5b0fa1c63b8e70"})
  SET r.kind = "signal", r.text = "This is `zeitgeist_synthesis` because the timing is load-bearing: the trigger is autonomy crossing from solved-demo to legal-deployment in 2025\u20132026 (the umbrella `full-self-driving-unlock` case).", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_7b5b0fa1c63b8e70"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_7b5b0fa1c63b8e70"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_7b5b0fa1c63b8e70"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_7b5b0fa1c63b8e70"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_7c2c9241ed129bfc"})
  SET r.kind = "claim", r.text = "Autonomy removes the **driver-fatigue ceiling** (sleep en route, wake there) and the **cost** at once, so a cheap, sleepable ground trip competes not with the 75-minute flight but with its *four-hour door-to-door reality* \u2014 and wins across the band that is half of US aviation.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_7c2c9241ed129bfc"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_7c2c9241ed129bfc"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_7c2c9241ed129bfc"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_7c2c9241ed129bfc"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_837ccfab0442f7f1"})
  SET r.kind = "claim", r.text = "Most people, once prompted, can see the first move: if cars stop crashing, car insurance and the body shop are in trouble.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_837ccfab0442f7f1"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_837ccfab0442f7f1"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_837ccfab0442f7f1"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "insurance"}) SET t.name = "insurance";
MATCH (r:KnowledgeRecord {id: "ks_837ccfab0442f7f1"}), (t:Tag {id: "insurance"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_85c44099a7d75b41"})
  SET r.kind = "hidden_variable", r.text = "The non-obvious counter-current: **the state wants its money.** Governments don't let a revenue line die quietly.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_85c44099a7d75b41"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_85c44099a7d75b41"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_85c44099a7d75b41"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_87155355d10aad90"})
  SET r.kind = "signal", r.text = "The mirror image is the **reclaimed time**: the average American commute is **27.2 min one-way** (\u22481 hr/day round trip; ACS 2024) with 69.2% driving alone \u2014 autonomy hands that hour back as attention/productivity, the new prize.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_87155355d10aad90"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_87155355d10aad90"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_87155355d10aad90"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_87155355d10aad90"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_87155355d10aad90"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_8a464491ea6290ab"})
  SET r.kind = "hidden_variable", r.text = "Ask the system to recover the actual problem (the removal of a ~$1T+ accident *substrate*, not a car-service upgrade), then to map the web (breadth) and game out the non-obvious second/third-order effects (depth), ending with what it converges to.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_8a464491ea6290ab"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_8a464491ea6290ab"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "accident"}) SET t.name = "accident";
MATCH (r:KnowledgeRecord {id: "ks_8a464491ea6290ab"}), (t:Tag {id: "accident"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_8a464491ea6290ab"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "substrate"}) SET t.name = "substrate";
MATCH (r:KnowledgeRecord {id: "ks_8a464491ea6290ab"}), (t:Tag {id: "substrate"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_90e8d48618e9ec97"})
  SET r.kind = "claim", r.text = "Remove the driver and that wage pool and roadside economy unwind, while freight cost collapses (reshaping logistics, retail margins, and reshoring math).", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_90e8d48618e9ec97"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_90e8d48618e9ec97"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_90e8d48618e9ec97"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "economy"}) SET t.name = "economy";
MATCH (r:KnowledgeRecord {id: "ks_90e8d48618e9ec97"}), (t:Tag {id: "economy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_90e8d48618e9ec97"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_94686333cdbee8bb"})
  SET r.kind = "case_frame", r.text = "Ask the system to recover the actual problem (a convergence re-pricing mobility and time across travel/labor/geography, mis-narrated as \"robotaxis in cities\" or as three unrelated trends), then game out the multi-chapter cascade into a `ZeitgeistSynthesisPayload`.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_94686333cdbee8bb"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_94686333cdbee8bb"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_94686333cdbee8bb"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "mobility"}) SET t.name = "mobility";
MATCH (r:KnowledgeRecord {id: "ks_94686333cdbee8bb"}), (t:Tag {id: "mobility"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_94686333cdbee8bb"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "travel"}) SET t.name = "travel";
MATCH (r:KnowledgeRecord {id: "ks_94686333cdbee8bb"}), (t:Tag {id: "travel"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_98a75e563469dec5"})
  SET r.kind = "signal", r.text = "## Source Notes - Synthetic case built from public reporting; the thesis is an analytical projection for use as an eval fixture, not an audited forecast.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_98a75e563469dec5"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_98a75e563469dec5"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_98a75e563469dec5"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_9f8f2741ae730d9d"})
  SET r.kind = "case_frame", r.text = "> **Cluster:** one convergence within the `full-self-driving-unlock` family (the > \"perfect Pepsis\" \u2014 see `../zeitgeist-synthesis-notes.md`).", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_9f8f2741ae730d9d"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_9f8f2741ae730d9d"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "cluster"}) SET t.name = "cluster";
MATCH (r:KnowledgeRecord {id: "ks_9f8f2741ae730d9d"}), (t:Tag {id: "cluster"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_9f8f2741ae730d9d"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_a75fae561994a53b"})
  SET r.kind = "claim", r.text = "The **culpability unit vanishes** \u2014 you can't cite a passenger \u2014 so liability moves from ~240M individual drivers to a few fleet operators/OEMs, emptying the highest-volume court docket in the country.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_a75fae561994a53b"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_a75fae561994a53b"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_a75fae561994a53b"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_acf838257ae1c4f7"})
  SET r.kind = "hidden_variable", r.text = "United States*) to vehicle searches, drug interdiction, warrant service, and **civil-asset forfeiture** \u2014 a pipeline that forfeits **$2\u20133B/yr federally** and mostly funds law-enforcement budgets.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_acf838257ae1c4f7"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_acf838257ae1c4f7"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_acf838257ae1c4f7"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_b1d1b823e80fac95"})
  SET r.kind = "signal", r.text = "The United States runs a ~$350 billion personal-auto insurance pool (about a third of all property-and- casualty premium), a multi-billion-dollar plaintiff bar, a trauma-medicine system, and a collision-repair industry, all of which exist to *price, litigate, repair, and treat human error behind the wheel*.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_b1d1b823e80fac95"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_b1d1b823e80fac95"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_b1d1b823e80fac95"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "insurance"}) SET t.name = "insurance";
MATCH (r:KnowledgeRecord {id: "ks_b1d1b823e80fac95"}), (t:Tag {id: "insurance"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_b4644feff268b3c8"})
  SET r.kind = "hidden_variable", r.text = "These revenues and powers are collected *whether or not anyone ever crashes*, so they are their own substrate and their own convergence.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_b4644feff268b3c8"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_b4644feff268b3c8"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_b4644feff268b3c8"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "substrate"}) SET t.name = "substrate";
MATCH (r:KnowledgeRecord {id: "ks_b4644feff268b3c8"}), (t:Tag {id: "substrate"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_bba9e18c2abc9cac"})
  SET r.kind = "signal", r.text = "The traffic stop is the single **most common reason for police-citizen contact in America** (~12.4M drivers + 3.8M passengers stopped in 2022; 58% of all police-initiated contact), and it is the **legal gateway** (the pretext stop, blessed by *Whren v.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_bba9e18c2abc9cac"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_bba9e18c2abc9cac"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_bba9e18c2abc9cac"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_c29339ea5782e73b"})
  SET r.kind = "claim", r.text = "Five years ago there was no credible removal of the violating driver; five years out the unwind \u2014 and the metering regime that replaces it \u2014 is consensus.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_c29339ea5782e73b"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_c29339ea5782e73b"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_c29339ea5782e73b"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_c29339ea5782e73b"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_c49a6031f986803f"})
  SET r.kind = "case_frame", r.text = "This chapter rides on Chapters 1 and 2 \u2014 it is the spatial consequence of cheap, sleepable, driver-free movement.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_c49a6031f986803f"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_c49a6031f986803f"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_c49a6031f986803f"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_c6a0e022f013a6a3"})
  SET r.kind = "signal", r.text = "Short-haul flights under 500 miles are ~**half of all US domestic flights but only ~30% of passengers**; the car already wins 82\u201391% of 100\u2013500-mile trips and air doesn't decisively cross over until ~700 miles.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_c6a0e022f013a6a3"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_c6a0e022f013a6a3"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_c6a0e022f013a6a3"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"})
  SET r.kind = "case_frame", r.text = "(Traffic fines, forfeiture, licensing, and the license-as-national-ID ride a *different* substrate \u2014 the driver as a policeable subject \u2014 and are handled in the sibling case `fsd-enforcement-economy`, Sub-cluster C; this case stays harm-only.) This is `zeitgeist_synthesis` because the timing is load-bearing: the trigger is autonomy crossing from solved-demo to legal-deployment in 2025\u20132026 (the umbrella case argues the capability is *solved*; this case takes that as given and asks what the accident economy does about it).", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "accident"}) SET t.name = "accident";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (t:Tag {id: "accident"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "cluster"}) SET t.name = "cluster";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (t:Tag {id: "cluster"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "economy"}) SET t.name = "economy";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (t:Tag {id: "economy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "sibling"}) SET t.name = "sibling";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (t:Tag {id: "sibling"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "substrate"}) SET t.name = "substrate";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (t:Tag {id: "substrate"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_d5e1dc3982822856"})
  SET r.kind = "case_frame", r.text = "> **Cluster:** **Sub-cluster C** of the `full-self-driving-unlock` family (the > \"perfect Pepsis\" \u2014 see `../zeitgeist-synthesis-notes.md`).", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_d5e1dc3982822856"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_d5e1dc3982822856"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "cluster"}) SET t.name = "cluster";
MATCH (r:KnowledgeRecord {id: "ks_d5e1dc3982822856"}), (t:Tag {id: "cluster"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_d5e1dc3982822856"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_de6275f81d0cd314"})
  SET r.kind = "claim", r.text = "Five years ago the car trip was capped by driver fatigue and there was no autonomy; five years out the substitution and the labor/time/geography re-pricing are consensus.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_de6275f81d0cd314"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_de6275f81d0cd314"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_de6275f81d0cd314"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_de6275f81d0cd314"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_de6275f81d0cd314"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_de6275f81d0cd314"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_dea97fbb794cbca4"})
  SET r.kind = "case_frame", r.text = "Chapter 3 \u2014 geography / real estate (where people live).** If you can sleep or work en route, the commute radius detaches from \"daily drive time.\" Exurban/rural land within a sleeper-commute arc re-rates; parking (a large share of urban land) gets reclaimed; megaregions (BosWash, Texas Triangle, Piedmont Atlantic) weld into single labor markets.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_dea97fbb794cbca4"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_dea97fbb794cbca4"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_dea97fbb794cbca4"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_dea97fbb794cbca4"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_e0f4610d97be57f3"})
  SET r.kind = "claim", r.text = "This case is about removing something different that autonomy also takes away: the human driver as a **policeable, fineable, registrable subject** \u2014 and the privately-operated vehicle as a registrable, inspectable object.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_e0f4610d97be57f3"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_e0f4610d97be57f3"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_e0f4610d97be57f3"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_e0f4610d97be57f3"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_e0f4610d97be57f3"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_e5d724e48fd900d0"})
  SET r.kind = "signal", r.text = "Figures are real and cited but applied to a forward projection; some dependencies (organ supply, ad budgets) are deliberately drawn at their *concentrated* edges and flagged as such \u2014 do not overstate them as macro lines.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_e5d724e48fd900d0"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_e5d724e48fd900d0"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_e5d724e48fd900d0"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_e6090356b4ae7272"})
  SET r.kind = "signal", r.text = "Travel-share, driver-count, truck-stop, and commute-time figures are real/cited; the substitution thesis and predictions are bets.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_e6090356b4ae7272"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_e6090356b4ae7272"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_e6090356b4ae7272"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_e810e181edfba949"})
  SET r.kind = "case_frame", r.text = "# Problem Statement: The Enforcement & Compliance Economy After Autonomy (the \"Traffic-State\") > **Doppl subtype:** `zeitgeist_synthesis` (see `../subtype-index.md`).", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_e810e181edfba949"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_e810e181edfba949"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_e810e181edfba949"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "economy"}) SET t.name = "economy";
MATCH (r:KnowledgeRecord {id: "ks_e810e181edfba949"}), (t:Tag {id: "economy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "enforcement"}) SET t.name = "enforcement";
MATCH (r:KnowledgeRecord {id: "ks_e810e181edfba949"}), (t:Tag {id: "enforcement"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_e810e181edfba949"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_e965efcb5505b5ee"})
  SET r.kind = "signal", r.text = "Signal sources (cited in the with-solution file and `../sources.md` Signal Set D9): BJS Police-Public Contact Survey (traffic stops); *Whren v.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_e965efcb5505b5ee"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_e965efcb5505b5ee"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_e965efcb5505b5ee"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_eda848ab218b06ac"})
  SET r.kind = "signal", r.text = "~**3 million** Americans drive for a living (\u22482.07M heavy/tractor-trailer + \u22481M light/delivery; BLS 2024), plus millions of rideshare/ delivery gig drivers; trucking is the most common job in many states.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_eda848ab218b06ac"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_eda848ab218b06ac"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_eda848ab218b06ac"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_f7c9e70e2c539ef8"})
  SET r.kind = "claim", r.text = "And the **compliance apparatus** \u2014 registration, inspection, emissions (already dying via EVs), driver licensing and the **driver's-license-as-national-ID** \u2014 loses its subject.", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_f7c9e70e2c539ef8"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_f7c9e70e2c539ef8"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_f7c9e70e2c539ef8"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_f7c9e70e2c539ef8"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_ffe2bb2bd9b115d7"})
  SET r.kind = "case_frame", r.text = "# Problem Statement: The Accident-Dependent Economy After Autonomy > **Doppl subtype:** `zeitgeist_synthesis` (see `../subtype-index.md`).", r.trustTier = "candidate", r.visibility = "public";
MATCH (r:KnowledgeRecord {id: "ks_ffe2bb2bd9b115d7"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_ffe2bb2bd9b115d7"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_ffe2bb2bd9b115d7"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "economy"}) SET t.name = "economy";
MATCH (r:KnowledgeRecord {id: "ks_ffe2bb2bd9b115d7"}), (t:Tag {id: "economy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_ffe2bb2bd9b115d7"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
