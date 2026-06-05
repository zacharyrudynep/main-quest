import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

// ── RESPONSIVE HOOK ────────────────────────────────────────────────────────────
function useIsMobile(bp=640) {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth <= bp : false);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= bp);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return mobile;
}

const COMPANIES_DATA = {
  "United States": {
    "Arizona": [
      { name: "Design Works Gaming", url: "https://www.designworksgaming.com/careers/", email: null },
      { name: "E-Line Media", url: "https://www.elinemedia.com/careers", email: null },
      { name: "Rainbow Studios", url: "https://www.rainbowstudios.com/careers/", email: null },
      { name: "Wolfpack Game Design", url: "https://www.wolfpackgamedesign.com/join-us", email: "wolfpackgamedesign@gmail.com", volunteer: true },
    ],
    "California": [
      { name: "2K Games", url: "https://2k.com/", email: null },
      { name: "Activision", url: "https://careers.activision.com/", email: null },
      { name: "Blizzard Entertainment", url: "https://careers.blizzard.com/global/en", email: null },
      { name: "Naughty Dog", url: "https://www.naughtydog.com/careers", email: null },
      { name: "Riot Games", url: "https://www.riotgames.com/en/work-with-us", email: null },
      { name: "Insomniac Games", url: "https://insomniac.games/careers", email: null },
      { name: "Respawn Entertainment", url: "https://www.respawn.com/careers", email: null },
      { name: "Rockstar Games", url: "https://www.rockstargames.com/careers", email: null },
      { name: "Epic Games", url: "https://www.epicgames.com/site/careers/jobs", email: null },
      { name: "Obsidian Entertainment", url: "https://www.obsidian.net/careers", email: null },
      { name: "Double Fine Productions", url: "https://www.doublefine.com/jobs", email: null },
      { name: "Dreamhaven", url: "https://www.dreamhaven.com/careers", email: null },
      { name: "Netflix Games", url: "https://jobs.netflix.com/", email: null },
      { name: "Amazon Game Studio", url: "https://www.amazongamestudios.com/en-us/careers", email: null },
      { name: "EA", url: "https://www.ea.com/careers", email: null },
      { name: "Roblox", url: "https://careers.roblox.com/", email: null },
      { name: "Niantic", url: "https://careers.scopely.com/us/en", email: null },
      { name: "Crystal Dynamics", url: "https://www.crystaldynamics.com/careers/", email: null },
      { name: "Scopely", url: "https://careers.scopely.com/us/en", email: null },
      { name: "InXile Entertainment", url: "https://www.inxile-entertainment.com/careers", email: null },
      { name: "Capcom USA", url: "https://jobs.jobvite.com/capcomusa", email: null },
      { name: "Kabam", url: "https://kabam.com/careers/", email: null },
      { name: "Discord", url: "https://discord.com/careers", email: null },
      { name: "Heart Machine", url: "https://www.heartmachine.com/careers", email: null },
      { name: "thatgamecompany", url: "https://thatgamecompany.com/careers/", email: null },
      { name: "Second Dinner", url: "https://www.seconddinner.com/careers/", email: null },
      { name: "Supercell", url: "https://supercell.com/en/careers/", email: null },
      { name: "Frost Giant Studios", url: "https://frostgiant.com/", email: null },
    ],
    "Colorado": [
      { name: "Deck Nine Games", url: "https://deckninegames.com/careers/", email: null },
      { name: "Dire Wolf Digital", url: "https://www.direwolfdigital.com/careers/", email: null },
      { name: "IllFonic", url: "https://illfonic.breezy.hr/", email: null },
      { name: "Serenity Forge", url: "https://www.serenityforge.com/careers", email: null },
    ],
    "Florida": [
      { name: "Chromatic Games", url: "https://chromatic.games/careers/", email: null },
      { name: "Studio Wildcard", url: "https://www.studiowildcard.com/", email: null },
      { name: "Grove Street Games", url: "https://grovestreetgames.com/careers/", email: null },
    ],
    "Georgia": [
      { name: "Hi-Rez Studios", url: "https://hirezstudios.applytojob.com/apply/", email: null },
      { name: "Tripwire Interactive", url: "https://tripwireinteractive.com/#/careers", email: null },
      { name: "Evil Mojo Games", url: "https://www.evilmojogames.com/", email: null },
    ],
    "Illinois": [
      { name: "Jackbox Games", url: "https://apply.workable.com/jackbox-games/?lng=en", email: null },
      { name: "Netherrealm Studios", url: "https://www.netherrealm.com/careers/", email: null },
      { name: "Iron Galaxy Studios", url: "https://www.irongalaxystudios.com/careers", email: null },
    ],
    "Maryland": [
      { name: "Bethesda Game Studios", url: "https://bethesdagamestudios.com/", email: null },
      { name: "Firaxis", url: "https://www.firaxis.com/", email: null },
      { name: "ZeniMax", url: "https://www.zenimax.com/en", email: null },
      { name: "Big Huge Games", url: "http://www.bighugegames.com/", email: null },
    ],
    "Massachusetts": [
      { name: "Harmonix", url: "https://www.harmonixmusic.com/", email: null },
      { name: "Ghost Story Games", url: "https://www.ghoststorygames.com/", email: null },
      { name: "CD Projekt Red Boston", url: "https://www.cdprojektred.com/en", email: null },
      { name: "Crate Entertainment", url: "https://www.crateentertainment.com/", email: null },
    ],
    "New York": [
      { name: "Rockstar New York", url: "https://www.rockstargames.com/careers", email: null },
      { name: "Take-Two Interactive", url: "https://www.take2games.com", email: null },
      { name: "Riot Games NY", url: "https://www.riotgames.com/en", email: null },
      { name: "Blizzard NY", url: "https://www.blizzard.com/en-us/", email: null },
      { name: "People Can Fly", url: "https://peoplecanfly.com", email: null },
      { name: "Velan Studios", url: "https://www.velanstudios.com", email: null },
      { name: "Brass Lion Entertainment", url: "https://www.brasslionentertainment.com", email: null },
    ],
    "North Carolina": [
      { name: "Imangi Studios", url: "https://imangistudios.com/careers/", email: null },
      { name: "Vavel Games", url: "https://careers.vavel.gs/", email: null },
    ],
    "Oregon": [
      { name: "Bend Studio", url: "https://www.bendstudio.com/careers", email: null },
      { name: "Nightdive Studios", url: "https://job-boards.greenhouse.io/nightdivestudios", email: null },
      { name: "Pipeworks", url: "https://www.pipeworks.com/new-careers/", email: null },
    ],
    "Pennsylvania": [
      { name: "Schell Games", url: "https://schellgames.com/", email: null },
      { name: "Mega Cat Studios", url: "https://megacatstudios.com/", email: null },
    ],
    "Texas": [
      { name: "id Software", url: "https://www.idsoftware.com/en", email: null },
      { name: "Gearbox Software", url: "https://www.gearboxsoftware.com/careers/", email: null },
      { name: "Retro Studios", url: "https://careers.nintendo.com/studios/retro-studios/", email: null },
      { name: "BioWare Austin", url: "https://www.bioware.com/careers/", email: null },
      { name: "Crystal Dynamics TX", url: "https://www.crystaldynamics.com/careers/", email: null },
      { name: "Certain Affinity", url: "https://www.certainaffinity.com/careers/", email: null },
      { name: "Cloud Imperium Games", url: "https://cloudimperiumgames.com/join-us", email: null },
      { name: "Devolver Digital", url: "https://www.devolverdigital.com/jobs", email: null },
      { name: "Gunfire Games", url: "https://gunfiregames.com/careers", email: null },
      { name: "Panic Button Games", url: "https://panicbuttongames.com/careers/", email: null },
      { name: "Owlchemy Labs", url: "https://owlchemylabs.com/career", email: null },
      { name: "Wizards of the Coast TX", url: "https://company.wizards.com/en/careers", email: null },
    ],
    "Washington": [
      { name: "Bungie", url: "https://careers.bungie.com/jobs", email: null },
      { name: "Valve Software", url: "https://www.valvesoftware.com/en/", email: null },
      { name: "Amazon Games Seattle", url: "https://www.amazongamestudios.com/en-us/careers", email: null },
      { name: "ArenaNet", url: "https://www.arena.net/en/careers", email: null },
      { name: "Undead Labs", url: "https://www.undeadlabs.com/careers", email: null },
      { name: "The Pokemon Company", url: "https://job-boards.greenhouse.io/pokemoncareers", email: null },
      { name: "Wizards of the Coast", url: "https://company.wizards.com/en/careers", email: null },
      { name: "PopCap", url: "https://www.ea.com/ea-studios/popcap/careers", email: null },
      { name: "Probably Monsters", url: "https://www.probablymonsters.com/en/careers/", email: null },
      { name: "Crystal Dynamics WA", url: "https://www.crystaldynamics.com/careers/", email: null },
      { name: "Cyan", url: "https://cyan.com/company/careers/", email: null },
      { name: "Worlds Edge", url: "https://www.ageofempires.com/careers/", email: null },
    ],
    "Wisconsin": [
      { name: "Raven Software", url: "https://careers.ravensoftware.com/", email: null },
      { name: "Filament Games", url: "https://www.filamentgames.com/careers/", email: null },
    ],
    "Remote": [
      { name: "Fortis Games", url: "https://www.fortisgames.com/en-us/careers", email: null },
      { name: "ZeniMax Online Studios", url: "https://www.zenimaxonline.com/en-us/home", email: null },
    ],
  },
  "Canada": {
    "British Columbia": [
      { name: "Activision Vancouver", url: "https://careers.activision.com/", email: null },
      { name: "Blackbird Interactive", url: "https://blackbirdinteractive.com/", email: null },
      { name: "CD Projekt Red Vancouver", url: "https://www.cdprojektred.com/en/jobs", email: null },
      { name: "EA Sports", url: "https://www.ea.com/ea-studios/ea-sports", email: null },
      { name: "Epic Games Vancouver", url: "https://www.epicgames.com/site/careers/jobs", email: null },
      { name: "Klei Entertainment", url: "https://www.klei.com/careers/", email: null },
      { name: "Kabam Vancouver", url: "https://kabam.com/careers/", email: null },
      { name: "Relic Entertainment", url: "https://www.relic.com/#careers", email: null },
      { name: "The Coalition", url: "https://www.thecoalitionstudio.com/careers/", email: null },
      { name: "Next Level Games", url: "https://nextlevelgames.com/jobs-at-next-level-games-subsidiary-of-nintendo-co-ltd/", email: null },
    ],
    "Ontario": [
      { name: "Digital Extremes", url: "https://www.digitalextremes.com/careers/list", email: null },
      { name: "Ubisoft Toronto", url: "https://toronto.ubisoft.com/jobs/", email: null },
      { name: "EA Canada", url: "https://www.ea.com/careers", email: null },
      { name: "Rockstar Toronto", url: "https://www.rockstargames.com/careers", email: null },
      { name: "Studio MDHR", url: "https://studiomdhr.com/careers/", email: null },
      { name: "Torn Banner Studios", url: "https://tornbanner.com/careers/", email: null },
      { name: "Certain Affinity ON", url: "https://www.certainaffinity.com/careers/", email: null },
      { name: "Take 2 Interactive ON", url: "https://careers.take2games.com/", email: null },
    ],
    "Quebec": [
      { name: "Larian Studios Montreal", url: "https://larian.com/careers", email: null },
      { name: "Ubisoft Montreal", url: "https://www.ubisoft.com/en-us/studio/montreal", email: null },
      { name: "Eidos Montreal", url: "https://www.eidosmontreal.com/careers/", email: null },
      { name: "WB Games Montreal", url: "https://wbgamesmontreal.com/careers/", email: null },
      { name: "Square Enix Montreal", url: "https://www.square-enix-games.com/en_US/careers", email: null },
      { name: "Compulsion Games", url: "https://compulsiongames.com/#careers", email: null },
      { name: "Behaviour Interactive", url: "https://www.bhvr.com/jobs/", email: null },
      { name: "Red Barrels", url: "https://redbarrelsgames.com/careers/", email: null },
      { name: "Quantic Dream", url: "https://www.quanticdream.com/en/careers", email: null },
      { name: "Gearbox Software QC", url: "https://www.gearboxsoftware.com/careers/", email: null },
      { name: "Yellow Brick Games", url: "https://yellowbrickgames.ca/jobs/", email: null },
      { name: "Thunder Lotus Games", url: "https://thunderlotusgames.com/jobs/", email: null },
    ],
    "Manitoba": [
      { name: "Ubisoft Winnipeg", url: "https://winnipeg.ubisoft.com/career/", email: null },
    ],
    "Alberta": [
      { name: "BioWare Edmonton", url: "https://www.bioware.com/careers/", email: null },
    ],
    "Nova Scotia": [
      { name: "HB Studios", url: "https://job-boards.greenhouse.io/hbstudios", email: null },
    ],
    "Saskatchewan": [
      { name: "Noodlecake Studios", url: "https://noodlecake.com/careers/", email: null },
      { name: "Studio MDHR SK", url: "https://studiomdhr.com/careers/", email: null },
    ],
  },
}

const VOLUNTEER_OVERRIDES = {
  "Wolfpack Game Design": { isVolunteer:true, jobs:[
    { title:"3D Character Animator", summary:"Rig and animate the diverse hybrid characters of World Soul, a post-apocalyptic narrative RPG in Unreal Engine 5. Volunteer — excellent for portfolio.", experience:"Entry Level", type:"Volunteer", salary:"Volunteer (unpaid)", isRemote:true, responsibilities:["Rig and animate humanoid and creature characters in UE5","Create locomotion, combat, and cinematic animations","Implement UE5 animation blueprints and state machines","Collaborate with character artists on visual direction"], requirements:["Portfolio demonstrating character animation in UE5 or similar","Experience rigging humanoid characters","Passion for narrative RPG games","Ability to work remotely and asynchronously"] },
    { title:"Art Producer", summary:"Coordinate cross-functional art teams for World Soul, driving milestone deliverables and liaising between creative and technical departments. Volunteer.", experience:"Mid Level", type:"Volunteer", salary:"Volunteer (unpaid)", isRemote:true, responsibilities:["Drive scheduling and production planning for art teams","Track asset pipelines across 2D, 3D, VFX, and animation","Maintain documentation and update Jira/ShotGrid","Communicate production goals clearly to team members"], requirements:["2+ years in art development or digital content production","Strong understanding of art workflows and pipelines","Experience with Jira, ShotGrid, or similar tools","Passion for indie game development"] },
    { title:"3D Character Artist", summary:"Model, sculpt, and texture high-quality character assets for World Soul, a post-apocalyptic RPG in UE5. Volunteer — great for building your portfolio.", experience:"Mid Level", type:"Volunteer", salary:"Volunteer (unpaid)", isRemote:true, responsibilities:["Model and sculpt character assets aligned with the visual direction","Create PBR textures in Substance Painter","Collaborate with the art director for visual consistency","Optimize assets for real-time UE5 performance"], requirements:["Strong portfolio of game-ready character art","Proficiency in ZBrush, Maya, or Blender","Experience with Substance Painter for PBR texturing","Interest in narrative RPG games"] },
    { title:"Environment Artist", summary:"Create immersive optimized environments for the post-apocalyptic world of World Soul in Unreal Engine 5. Volunteer position.", experience:"Mid Level", type:"Volunteer", salary:"Volunteer (unpaid)", isRemote:true, responsibilities:["Build modular environment kits and hero assets in UE5","Create tileable textures and materials in Substance","Work with art director on visual quality","Optimize assets for real-time performance"], requirements:["Portfolio showing game-ready environment art","Proficiency with UE5 or similar real-time engine","Experience with modular asset workflows","Knowledge of PBR texturing pipelines"] },
    { title:"UI/UX Designer", summary:"Design and implement intuitive thematic UI for World Soul — menus, HUDs, and inventory systems native to the post-apocalyptic game world. Volunteer.", experience:"Entry Level", type:"Volunteer", salary:"Volunteer (unpaid)", isRemote:true, responsibilities:["Design UI including HUDs, menus, and inventory screens","Create wireframes and prototypes for key game systems","Collaborate with programmers to implement UI in UE5","Maintain accessibility and visual consistency"], requirements:["Portfolio demonstrating game UI or UX work","Familiarity with UE5 UMG or similar UI frameworks","Strong visual design sense","Experience with Figma a plus"] },
  ]}
};

const JOB_CATS = ["Game Designer","Level Designer","Narrative Designer","Software Engineer","Graphics Engineer","AI Programmer","Gameplay Programmer","Backend Engineer","DevOps Engineer","Mobile Developer","3D Artist","2D Artist","Concept Artist","Technical Artist","Character Artist","Environment Artist","Animator","VFX Artist","UI/UX Designer","Sound Designer","Composer","Audio Engineer","Producer","Project Manager","Scrum Master","QA Tester","QA Lead","Build Engineer","Community Manager","Marketing Specialist","PR Manager","Data Analyst","Data Scientist","Product Manager","IT Support","System Administrator","HR Manager","Recruiter","Finance Analyst"];

const JOB_SUMMARIES = {"Game Designer":"Design engaging gameplay systems and player experiences.","Gameplay Programmer":"Build character controllers, physics, and combat mechanics in C++ or C#.","Software Engineer":"Build robust engine systems, tools, and runtime features.","Graphics Engineer":"Develop real-time rendering systems, shaders, and visual effects.","Level Designer":"Craft memorable spaces that guide players through gameplay.","Narrative Designer":"Shape stories through dialogue, quests, and worldbuilding.","3D Artist":"Create high-quality game-ready 3D assets.","2D Artist":"Create 2D art assets including UI, icons, and textures.","Concept Artist":"Define visual language through characters, environments, and props.","Technical Artist":"Bridge art and engineering via pipelines, shaders, and tools.","Character Artist":"Create detailed, game-ready character models and textures.","Environment Artist":"Build immersive, performance-optimized game environments.","Animator":"Bring characters to life through expressive game-ready animation.","VFX Artist":"Create stunning real-time visual effects for gameplay and cinematics.","UI/UX Designer":"Design intuitive interfaces that give players seamless access to systems.","Sound Designer":"Design and implement sounds that make the game world feel alive.","Composer":"Create adaptive musical scores that enhance gameplay and emotion.","Audio Engineer":"Implement and optimize audio systems using Wwise or FMOD.","Producer":"Keep teams aligned and production running smoothly from concept to launch.","Project Manager":"Own schedules, milestones, and cross-team communication.","Scrum Master":"Facilitate agile ceremonies and remove blockers across teams.","QA Tester":"Champion quality by finding and documenting bugs before players do.","QA Lead":"Lead QA strategy, test plans, and quality standards.","Build Engineer":"Design and maintain CI/CD pipelines and build systems.","Community Manager":"Bridge the studio and player community across all platforms.","Marketing Specialist":"Drive awareness and player acquisition through targeted campaigns.","PR Manager":"Manage press relationships and shape the studio's public narrative.","Data Analyst":"Turn player data into actionable insights.","Data Scientist":"Apply ML to telemetry, matchmaking, and monetization.","Product Manager":"Own the product roadmap and drive features from concept to launch.","AI Programmer":"Build sophisticated AI systems for NPCs, enemies, and simulation.","Backend Engineer":"Design and scale server infrastructure for online games.","DevOps Engineer":"Build and maintain reliable cloud infrastructure and deployments.","Mobile Developer":"Build performant game clients for iOS and Android.","IT Support":"Keep studio technology running and support team productivity.","System Administrator":"Manage studio networks, servers, and security.","HR Manager":"Lead people operations, culture, and talent programs.","Recruiter":"Find and bring exceptional talent into the studio.","Finance Analyst":"Support financial planning, forecasting, and reporting."};

const SENIOR_CATS = new Set(["Graphics Engineer","Technical Artist","AI Programmer","Gameplay Programmer","Build Engineer","System Administrator","Data Scientist","Product Manager","Finance Analyst","QA Lead","Producer","Project Manager","Scrum Master","Backend Engineer","DevOps Engineer"]);
const ENTRY_CATS = new Set(["QA Tester","Community Manager","2D Artist","Animator","Recruiter","IT Support"]);

function getExp(title, r) {
  if (SENIOR_CATS.has(title)) { const p=["Mid Level","Mid Level","Senior","Senior","Lead","Principal","Director"]; return p[Math.floor(r()*p.length)]; }
  if (ENTRY_CATS.has(title)) { const p=["Entry Level","Entry Level","Mid Level","Mid Level","Senior","Lead"]; return p[Math.floor(r()*p.length)]; }
  const p=["Entry Level","Mid Level","Mid Level","Senior","Senior","Lead"]; return p[Math.floor(r()*p.length)];
}

function seededRand(seed) { let s=seed; return ()=>{ s=(s*1664525+1013904223)&0xffffffff; return (s>>>0)/0xffffffff; }; }

function genJobs(company, stateKey) {
  const ov = VOLUNTEER_OVERRIDES[company.name];
  if (ov) return ov.jobs.map((j,i)=>({ id:`${company.name}-ov-${i}`, title:j.title, company:company.name, url:company.url, applyUrl:company.url, state:stateKey, posted:new Date(Date.now()-(i*7+2)*86400000), postedStr:new Date(Date.now()-(i*7+2)*86400000).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}), daysAgo:i*7+2, isNew:i===0, isRemote:j.isRemote, type:j.type, salary:j.salary, email:company.email, experience:j.experience, isVolunteer:true, summary:j.summary, responsibilities:j.responsibilities||[], requirements:j.requirements||[] }));
  const r=seededRand(company.name.split("").reduce((a,c)=>a+c.charCodeAt(0),0));
  const now=Date.now(), count=Math.floor(r()*4)+1, jobs=[];
  for(let i=0;i<count;i++){
    const catIdx=Math.floor(r()*JOB_CATS.length), daysAgo=Math.floor(r()*60);
    const lo=Math.round((60+r()*80)*1000/1000)*1000, hi=lo+Math.round((20+r()*60)*1000/1000)*1000;
    const title=JOB_CATS[catIdx];
    jobs.push({ id:`${company.name}-${i}-${catIdx}`, title, company:company.name, url:company.url, applyUrl:company.url, state:stateKey, posted:new Date(now-daysAgo*86400000), postedStr:new Date(now-daysAgo*86400000).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}), daysAgo, isNew:daysAgo<3, isRemote:r()>0.6, type:r()>0.3?"Full-time":"Contract", salary:`$${(lo/1000).toFixed(0)}k – $${(hi/1000).toFixed(0)}k`, email:company.email, experience:getExp(title,r), isVolunteer:false, summary:JOB_SUMMARIES[title]||"Join our team and create outstanding games.", responsibilities:[], requirements:[] });
  }
  return jobs;
}

// Build all job data once at module level
const ALL_JOBS_DATA = {};
for (const [country,states] of Object.entries(COMPANIES_DATA)) {
  ALL_JOBS_DATA[country] = {};
  for (const [state,companies] of Object.entries(states)) {
    ALL_JOBS_DATA[country][state] = {};
    for (const company of companies) {
      ALL_JOBS_DATA[country][state][company.name] = { ...company, jobs: genJobs(company, state) };
    }
  }
}

const GREENHOUSE_TOKENS = {
  "Nightdive Studios":"nightdivestudios","Cat Daddy Games":"catdaddy","Schell Games":"schellgames",
  "Jackbox Games":"jackboxgames","Probably Monsters":"probablymonsters","Torn Banner Studios":"tornbannerstudios",
  "Klei Entertainment":"klei","The Pokemon Company":"pokemoncareers","Fortis Games":"fortisgames",
  "Bungie":"bungie","Riot Games":"riotgames","Insomniac Games":"insomniac","Respawn Entertainment":"respawn",
  "Double Fine Productions":"doublefine","Dreamhaven":"dreamhaven","Heart Machine":"heartmachine",
  "Second Dinner":"seconddinner","Frost Giant Studios":"frostgiant","Deck Nine Games":"deckninegames",
  "Hi-Rez Studios":"hirezstudios","Iron Galaxy Studios":"irongalaxystudios","Brass Lion Entertainment":"brasslion",
  "Velan Studios":"velanstudios","Cyan":"cyanworlds","Undead Labs":"undeadlabs",
  "thatgamecompany":"thatgamecompany","Harmonix":"harmonix","Bend Studio":"bendstudio",
  "Blackbird Interactive":"blackbirdinteractive","Digital Extremes":"digitalextremes",
  "Behaviour Interactive":"bhvr","Red Barrels":"redbarrels","Thunder Lotus Games":"thunderlotus",
  "Yellow Brick Games":"yellowbrickgames",
};

function normalizeGreenhouseJob(raw, company, stateKey) {
  const stripHtml = h => (h||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  const body = stripHtml(raw.content||"");
  const sm = body.match(/\$(\d[\d,]+)\s*[-\u2013]+\s*\$(\d[\d,]+)/i);
  const salary = sm ? `$${parseInt(sm[1].replace(/,/g,"")).toLocaleString()} \u2013 $${parseInt(sm[2].replace(/,/g,"")).toLocaleString()}` : "Salary not listed";
  const daysAgo = Math.floor((Date.now()-new Date(raw.updated_at||raw.first_published_at).getTime())/86400000);
  const guessExp = t => { const tl=(t||"").toLowerCase(); if(/director|head of|vp/.test(tl))return"Director"; if(/principal/.test(tl))return"Principal"; if(/\blead\b/.test(tl))return"Lead"; if(/senior|sr\./.test(tl))return"Senior"; if(/junior|jr\.|intern/.test(tl))return"Entry Level"; return"Mid Level"; };
  return { id:`gh-${raw.id}`, title:raw.title, company:company.name, url:raw.absolute_url||company.url, applyUrl:raw.absolute_url||company.url, state:stateKey, posted:new Date(raw.updated_at||raw.first_published_at), postedStr:new Date(raw.updated_at||raw.first_published_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}), daysAgo, isNew:daysAgo<3, isRemote:/remote|distributed/i.test(raw.title+" "+body), type:"Full-time", salary, email:company.email, experience:guessExp(raw.title), isVolunteer:false, isLive:true, summary:body.slice(0,240).trim()+(body.length>240?"\u2026":""), responsibilities:[], requirements:[] };
}

const EMAIL_PROVIDERS = {
  gmail:(to,s,b)=>`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`,
  outlook:(to,s,b)=>`https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`,
  yahoo:(to,s,b)=>`https://compose.mail.yahoo.com/?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`,
  proton:()=>`https://mail.proton.me/u/0/inbox#compose`,
};
const PROVIDER_LABELS={gmail:"Gmail",outlook:"Outlook",yahoo:"Yahoo Mail",proton:"ProtonMail"};

// ── GEMINI AI HELPER — free, no credit card. Get key at aistudio.google.com ──
async function callAI(prompt,maxTokens=2000){
  const key=process.env.NEXT_PUBLIC_GEMINI_KEY;
  if(!key)throw new Error("Missing NEXT_PUBLIC_GEMINI_KEY. Get a free key at aistudio.google.com and add it in Vercel \u2192 Settings \u2192 Environment Variables.");
  const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${key}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:maxTokens,temperature:0.7}})});
  if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e?.error?.message||`Gemini API error ${res.status}. Check your API key.`);}
  const data=await res.json();
  if(!data.candidates?.length)throw new Error("Gemini returned no response. Please try again.");
  return data.candidates[0].content?.parts?.[0]?.text||"";
}

// ── ICONS ────────────────────────────────────────────────────────────────────
const I={
  Sword:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="14" x2="10" y2="6"/><line x1="10" y1="2" x2="14" y2="6"/><line x1="9" y1="3" x2="13" y2="7"/></svg>,
  Scroll:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h9a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><line x1="5" y1="6" x2="11" y2="6"/><line x1="5" y1="9" x2="9" y2="9"/></svg>,
  Map:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polygon points="1,3 6,1 10,3 15,1 15,13 10,15 6,13 1,15"/><line x1="6" y1="1" x2="6" y2="13"/><line x1="10" y1="3" x2="10" y2="15"/></svg>,
  Star:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polygon points="8,1.5 10,6 15,6.5 11.5,10 12.5,15 8,12.5 3.5,15 4.5,10 1,6.5 6,6"/></svg>,
  Compass:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5"/><polygon points="8,3 9.5,8 8,7 6.5,8" fill={c} stroke="none"/></svg>,
  Flame:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14.5c-3 0-5-2-5-5 0-2 1-3.5 2.5-4.5 0 1.5 1 2.5 1 2.5 0-2 1-4.5 3-6 0 2 1.5 3 2 5 .5-1 .5-2 0-3 2 1.5 2.5 3.5 2.5 5 0 3-2 6-6 6z"/></svg>,
  Lightning:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="10,1.5 4,9 8,9 6,14.5 12,7 8,7"/></svg>,
  Globe:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M8 1.5C6 4 5 6 5 8s1 4 3 6.5"/><path d="M8 1.5c2 2.5 3 4.5 3 6.5s-1 4-3 6.5"/><line x1="1.5" y1="8" x2="14.5" y2="8"/></svg>,
  Person:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>,
  Link:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 9.5a4 4 0 0 0 5.7 0l2-2a4 4 0 0 0-5.7-5.7L7 3.3"/><path d="M9.5 6.5a4 4 0 0 0-5.7 0l-2 2a4 4 0 0 0 5.7 5.7L9 12.7"/></svg>,
  Cog:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M13 3l-1 1M4 12l-1 1"/></svg>,
  Lock:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/><circle cx="8" cy="11" r="1" fill={c} stroke="none"/></svg>,
  Check:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,8 6.5,12.5 14,4"/></svg>,
  X:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/></svg>,
  Refresh:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 8A5.5 5.5 0 1 1 10 3l3.5-.5V6"/></svg>,
  Sparkle:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1l1.2 4.8L14 8l-4.8 1.2L8 15l-1.2-4.8L2 8l4.8-1.2z"/></svg>,
  Send:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><line x1="14" y1="2" x2="1" y2="8"/><line x1="14" y1="2" x2="8" y2="14"/><line x1="1" y1="8" x2="8" y2="14"/></svg>,
  Copy:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="5" width="9" height="10" rx="1.5"/><path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2"/></svg>,
  Robot:({s=18,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 18 18" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="12" height="9" rx="2"/><rect x="6" y="9" width="2" height="2" rx="0.5"/><rect x="10" y="9" width="2" height="2" rx="0.5"/><line x1="7" y1="13" x2="11" y2="13"/><line x1="9" y1="6" x2="9" y2="3"/><circle cx="9" cy="2.5" r="1.5"/><line x1="1.5" y1="9" x2="3" y2="9"/><line x1="15" y1="9" x2="16.5" y2="9"/></svg>,
  Arrow:({s=14,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"><line x1="2" y1="7" x2="12" y2="7"/><polyline points="8,3 12,7 8,11"/></svg>,
  Bell:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5A4.5 4.5 0 0 0 3.5 6v3L2 11h12l-1.5-2V6A4.5 4.5 0 0 0 8 1.5z"/><path d="M6.5 11v.5a1.5 1.5 0 0 0 3 0V11"/></svg>,
  Alert:({s=18})=><svg width={s} height={s} viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="#c0321a"/><line x1="9" y1="5" x2="9" y2="10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="13" r="1" fill="white"/></svg>,
};

// ── AUTH ─────────────────────────────────────────────────────────────────────
function Auth({onLogin}) {
  const mobile = useIsMobile();
  const [mode,setMode]=useState("login");
  const [name,setName]=useState(""),  [email,setEmail]=useState(""), [pass,setPass]=useState("");
  const [err,setErr]=useState(""), [loading,setLoading]=useState(false), [show,setShow]=useState(false);
  const submit = async () => {
    setErr("");
    if (!email || !pass) { setErr("Fill in all fields."); return; }
    if (mode === "signup" && !name) { setErr("Enter your name."); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password: pass });
        if (error) { setErr(error.message); setLoading(false); return; }
        await supabase.from("profiles").insert({ id: data.user.id, name });
        onLogin({ id: data.user.id, email, name, applied: {}, profile: {} });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) { setErr("Invalid email or password."); setLoading(false); return; }
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
        const { data: apps } = await supabase.from("applications").select("*").eq("user_id", data.user.id);
        const applied = {};
        (apps || []).forEach(a => { applied[a.job_id] = { date: a.applied_at }; });
        onLogin({ id: data.user.id, email, name: profile?.name || email, applied, profile: profile || {} });
      }
    } catch (e) {
      setErr("Something went wrong. Please try again.");
      setLoading(false);
    }
  };
  const G="linear-gradient(135deg,#c9a84c,#e8613a)";
  return <>
    <Head>
      <title>Main Quest — Sign In</title>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Cinzel:wght@400;700;900&family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet"/>
    </Head>
    <div style={{minHeight:"100vh",background:"#080608",display:"flex",fontFamily:"'Space Grotesk',sans-serif",position:"relative",overflow:"hidden",alignItems:"stretch"}}>
    <style>{`.ai{color:#f4edd8}.ai-in{animation:ain .6s both}@keyframes ain{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes ob1{0%,100%{transform:translate(0,0)}50%{transform:translate(50px,-30px)}}@keyframes ob2{0%,100%{transform:translate(0,0)}50%{transform:translate(-60px,30px)}}input.mq-in{width:100%;background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.22);color:#f4edd8;border-radius:10px;padding:10px 12px 10px 38px;font-size:14px;font-family:'Space Grotesk',sans-serif;box-sizing:border-box;transition:all .2s}input.mq-in:focus{outline:none;border-color:#c9a84c;background:rgba(201,168,76,.1);box-shadow:0 0 0 3px rgba(201,168,76,.15)}input.mq-in::placeholder{color:rgba(244,237,216,.3)}`}</style>
    <div style={{position:"fixed",inset:0,pointerEvents:"none"}}>
      <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",filter:"blur(120px)",opacity:.18,background:"radial-gradient(circle,#c9a84c,transparent)",top:-180,left:-120,animation:"ob1 18s ease-in-out infinite"}}/>
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",filter:"blur(120px)",opacity:.14,background:"radial-gradient(circle,#8b2020,transparent)",bottom:-180,right:-120,animation:"ob2 22s ease-in-out infinite"}}/>
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(201,168,76,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.025) 1px,transparent 1px)",backgroundSize:"56px 56px"}}/>
    </div>
    {/* Left branding */}
    {!mobile && <div className="ai-in" style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"48px 52px",position:"sticky",top:0,height:"100vh",maxWidth:580,zIndex:1,overflowY:"auto"}}>
      {/* Logo */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:28}}>
        <div style={{fontSize:44,filter:"drop-shadow(0 0 20px rgba(201,168,76,.6))"}}>⚔️</div>
        <div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"rgba(201,168,76,.55)",letterSpacing:5,lineHeight:1,marginBottom:4}}>— YOUR CAREER —</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:32,fontWeight:700,background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.1}}>Main Quest</div>
        </div>
      </div>
      {/* Hero tagline */}
      <h1 style={{fontFamily:"'Cinzel',serif",fontSize:28,fontWeight:700,color:"#f4edd8",lineHeight:1.3,marginBottom:10,letterSpacing:.5}}>Your launchpad into the game industry.</h1>
      <p style={{color:"rgba(244,237,216,.55)",fontSize:14,lineHeight:1.7,marginBottom:28}}>Main Quest aggregates job listings from 300+ game studios across North America — with AI-powered tools to help you write better applications, track your progress, and land interviews faster.</p>
      {/* Divider */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24,opacity:.5}}>
        <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(201,168,76,.6))"}}/>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"#c9a84c",letterSpacing:2}}>✦ ✦ ✦</span>
        <div style={{flex:1,height:1,background:"linear-gradient(270deg,transparent,rgba(201,168,76,.6))"}}/>
      </div>
      {/* Features */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:24}}>
        {[
          ["⚔️","Job Board","300+ studios filtered by country, state, role, and experience."],
          ["🤖","AI Apply","Cover letter, ATS score, and interview prep in seconds."],
          ["📜","Resume Upload","Upload your resume to auto-fill your profile for AI applications."],
          ["📋","App Tracker","Track every application with dates and one-click access."],
          ["✉️","AI Email","Draft a personalized email and send it from Gmail or Outlook."],
          ["🔔","New Alerts","New postings flagged in real time so you never miss one."],
        ].map(([ic,title,desc])=>
          <div key={title} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.1)",borderRadius:10}}>
            <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{ic}</span>
            <div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:11,fontWeight:700,color:"#f0d080",marginBottom:2,letterSpacing:.3}}>{title}</div>
              <div style={{fontSize:11,color:"rgba(244,237,216,.48)",lineHeight:1.45}}>{desc}</div>
            </div>
          </div>
        )}
      </div>
      {/* Stats */}
      <div style={{display:"flex",alignItems:"center",gap:0,background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.12)",borderRadius:12,overflow:"hidden"}}>
        {[["300+","Studios"],["800+","Openings"],["40+","Live via API"],["2","Countries"]].map(([n,l],i)=>(
          <div key={l} style={{flex:1,padding:"12px 0",textAlign:"center",borderRight:i<3?"1px solid rgba(201,168,76,.12)":"none"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{n}</div>
            <div style={{fontSize:9,color:"rgba(244,237,216,.35)",textTransform:"uppercase",letterSpacing:1,fontFamily:"'Cinzel',serif"}}>{l}</div>
          </div>
        ))}
      </div>
    </div>}
    {/* Right form */}
    <div style={{flex:mobile?"1":"0 0 500px",display:"flex",alignItems:"center",justifyContent:"center",padding:mobile?"20px 16px":"40px 48px",position:"relative",zIndex:1,overflowY:"auto",minHeight:"100vh"}}>
      <div style={{width:"100%",maxWidth:420,background:"rgba(20,14,28,.88)",backdropFilter:"blur(30px)",border:"1px solid rgba(201,168,76,.22)",borderRadius:22,overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,.5)"}}>
        <div style={{display:"flex",position:"relative",background:"rgba(0,0,0,.25)"}}>
          {["login","signup"].map((m,i)=><button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,background:"none",border:"none",cursor:"pointer",color:mode===m?"#f4edd8":"rgba(244,237,216,.35)",fontSize:11,fontWeight:600,padding:"14px",fontFamily:"'Cinzel',serif",letterSpacing:1,textTransform:"uppercase"}}>{i===0?"Sign In":"Create Account"}</button>)}
          <div style={{position:"absolute",bottom:0,left:0,width:"50%",height:2,background:G,borderRadius:2,transition:"transform .25s",transform:`translateX(${mode==="login"?"0%":"100%"})`}}/>
        </div>
        <div style={{padding:"24px 24px 28px",display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:"#f4edd8",marginBottom:4}}>{mode==="login"?"Welcome Back":"Begin Your Journey"}</div>
            <div style={{fontSize:12,color:"rgba(244,237,216,.5)",fontStyle:"italic"}}>{mode==="login"?"Sign in to track your applications.":"Create your account to get started."}</div>
          </div>
          {mode==="signup"&&<div>
            <div style={{fontSize:10,color:"rgba(201,168,76,.8)",textTransform:"uppercase",letterSpacing:1.5,fontFamily:"'Cinzel',serif",marginBottom:5}}>Full Name</div>
            <div style={{position:"relative"}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,opacity:.5,pointerEvents:"none"}}>👤</span><input className="mq-in" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} autoFocus/></div>
          </div>}
          <div>
            <div style={{fontSize:10,color:"rgba(201,168,76,.8)",textTransform:"uppercase",letterSpacing:1.5,fontFamily:"'Cinzel',serif",marginBottom:5}}>Email Address</div>
            <div style={{position:"relative"}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,opacity:.5,pointerEvents:"none"}}>📜</span><input className="mq-in" type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} autoFocus={mode==="login"}/></div>
          </div>
          <div>
            <div style={{fontSize:10,color:"rgba(201,168,76,.8)",textTransform:"uppercase",letterSpacing:1.5,fontFamily:"'Cinzel',serif",marginBottom:5}}>Password</div>
            <div style={{position:"relative"}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,opacity:.5,pointerEvents:"none"}}>🔐</span><input className="mq-in" type={show?"text":"password"} placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} style={{paddingRight:40}}/><button onClick={()=>setShow(s=>!s)} tabIndex={-1} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:14,opacity:.5}}>{show?"🙈":"👁"}</button></div>
          </div>
          {err&&<div style={{background:"rgba(192,50,26,.12)",border:"1px solid rgba(192,50,26,.3)",color:"#ff8080",borderRadius:8,padding:"9px 14px",fontSize:12,display:"flex",alignItems:"center",gap:8}}>⚠ {err}</div>}
          <button onClick={submit} disabled={loading} style={{background:G,border:"none",color:"#0a0608",cursor:loading?"not-allowed":"pointer",fontSize:12,fontWeight:800,padding:13,borderRadius:10,fontFamily:"'Cinzel',serif",letterSpacing:1.5,textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:loading?.7:1,transition:"all .2s"}} onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(201,168,76,.35)"}}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=""}}>{loading?"⟳":<>{mode==="login"?"Enter the Guild":"Forge Account"} →</>}</button>
          <div style={{display:"flex",alignItems:"center",gap:10,color:"rgba(244,237,216,.2)"}}>
            <div style={{flex:1,height:1,background:"rgba(201,168,76,.12)"}}/>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"rgba(201,168,76,.35)",letterSpacing:2}}>✦</span>
            <div style={{flex:1,height:1,background:"rgba(201,168,76,.12)"}}/>
          </div>
          <p style={{textAlign:"center",fontSize:12,color:"rgba(244,237,216,.4)",margin:0}}>
            {mode==="login"?"Don't have an account? ":"Already have an account? "}
            <button onClick={()=>{setMode(m=>m==="login"?"signup":"login");setErr("");}} style={{background:"none",border:"none",cursor:"pointer",color:"#c9a84c",fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:700}}>{mode==="login"?"Sign up free":"Sign in instead"}</button>
          </p>
        </div>
      </div>
    </div>
  </div>
  </>;
}

// ── COPY BUTTON ───────────────────────────────────────────────────────────────
function CopyBtn({text,label="Copy"}) {
  const [done,setDone]=useState(false);
  const copy=()=>navigator.clipboard.writeText(text).then(()=>{setDone(true);setTimeout(()=>setDone(false),2000)});
  return <button onClick={copy} style={{background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.2)",color:"rgba(244,237,216,.6)",cursor:"pointer",borderRadius:6,fontSize:11,padding:"3px 10px",fontFamily:"'Cinzel',serif",display:"inline-flex",alignItems:"center",gap:4,transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(201,168,76,.14)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(201,168,76,.08)"}>
    {done?<I.Check s={11} c="#7ecfb3"/>:<I.Copy s={11} c="currentColor"/>}{done?"Copied!":label}
  </button>;
}

// ── AI APPLY MODAL ─────────────────────────────────────────────────────────── 
function AIApplyModal({job,user,onClose,onApplied}) {
  const mobile = useIsMobile();
  const [phase,setPhase]=useState("check");
  const [result,setResult]=useState(null);
  const [err,setErr]=useState("");
  const profile=user?.profile||{};
  const isVol=job.isVolunteer||job.salary?.toLowerCase().includes("volunteer");

  const profileStr=[
    profile.name&&`Name: ${profile.name}`,profile.role&&`Role: ${profile.role}`,
    profile.experience&&`Level: ${profile.experience}`,profile.skills&&`Skills: ${profile.skills}`,
    profile.yearsExp&&`Years: ${profile.yearsExp}`,profile.education&&`Education: ${profile.education}`,
    profile.workHistory&&`History: ${profile.workHistory}`,profile.achievements&&`Achievements: ${profile.achievements}`,
    profile.linkedin&&`LinkedIn: ${profile.linkedin}`,profile.portfolio&&`Portfolio: ${profile.portfolio}`,
  ].filter(Boolean).join("\n");

  const gen=async()=>{
    setPhase("generating");setErr("");
    try{
      const txt=await callAI(`Senior game industry recruiter using XYZ formula. Be brutally honest.\n\nJOB: ${job.company} — ${job.title} (${job.experience||"unspecified"}, ${job.type}${job.isRemote?", Remote":""})\n${isVol?"VOLUNTEER/UNPAID role":`Salary: ${job.salary}`}\nSummary: ${job.summary||""}\n\nAPPLICANT:\n${profileStr||"No profile provided — write strong generic materials the applicant can customize."}\n\nReturn ONLY valid JSON (no markdown fences):\n{"matchScore":72,"matchVerdict":"one honest sentence on fit","missingKeywords":["keyword1","keyword2","keyword3"],"coverLetter":"3 paragraphs under 260 words using the XYZ formula (Accomplished X measured by Y by doing Z). Para 1: specific hook about ${job.company}. Para 2: two achievements matching their requirements. Para 3: address the biggest gap honestly and ask for an interview. Human tone.","resumeBullets":["XYZ-formula bullet 1","XYZ bullet 2","XYZ bullet 3"],"strengthsMatch":["your strength matched to their requirement 1","strength 2","strength 3"],"commonQuestions":[{"q":"Tell me about yourself","a":"90-second pitch tailored to this role"},{"q":"Why ${job.company}?","a":"specific answer referencing their work"},{"q":"Walk me through a relevant project","a":"STAR-format answer"},{"q":"Biggest weakness?","a":"real weakness plus concrete fix"}],"emailSubject":"Application: ${job.title} | [Your Name]","tips":["tip specific to ${job.company}","add the top missing keyword naturally","follow up in 5 days with specific value"]}`);
      const clean=txt.replace(/```json|```/g,"").trim();
      const s=clean.indexOf("{"),e=clean.lastIndexOf("}");
      setResult(JSON.parse(clean.slice(s,e+1)));
      setPhase("result");
    }catch(er){setErr(er?.message||"Could not generate. Check that NEXT_PUBLIC_GEMINI_KEY is set in Vercel environment variables.");setPhase("check");}
  };

  const scoreColor=s=>s>=70?"#7ecfb3":s>=45?"#c9a84c":"#e07060";
  const scoreBg=s=>s>=70?"rgba(126,207,179,.1)":s>=45?"rgba(201,168,76,.1)":"rgba(192,50,26,.1)";
  const G="linear-gradient(135deg,#c9a84c,#e8613a)";
  const inp={background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.18)",color:"#f4edd8",borderRadius:8,padding:"8px 12px",fontSize:12,fontFamily:"inherit",width:"100%",boxSizing:"border-box",transition:"all .2s"};
  const modal={position:"fixed",inset:0,background:"rgba(0,0,0,.85)",backdropFilter:"blur(16px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"};
  const card={background:"rgba(14,10,20,.98)",border:"1px solid rgba(201,168,76,.25)",borderRadius:mobile?14:20,width:"100%",maxWidth:640,maxHeight:"calc(100vh - 32px)",display:"flex",flexDirection:"column",margin:"auto",flexShrink:0,boxShadow:"0 32px 80px rgba(0,0,0,.6)"};
  const hdr={display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px 14px",borderBottom:"1px solid rgba(201,168,76,.12)",flexShrink:0};
  const body={flex:1,overflowY:"auto",padding:"18px 20px",minHeight:0};
  const sec={background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.1)",borderRadius:10,padding:"12px 14px",marginBottom:10};
  const secHdr={display:"flex",alignItems:"center",gap:8,marginBottom:8};
  const secTitle={flex:1,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"#c9a84c",fontFamily:"'Cinzel',serif"};
  const txt12={fontSize:12,color:"rgba(244,237,216,.65)",lineHeight:1.6};
  const xtBtn={background:"rgba(244,237,216,.06)",border:"1px solid rgba(244,237,216,.1)",color:"rgba(244,237,216,.5)",cursor:"pointer",width:30,height:30,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"};

  return <div style={modal} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div style={card}>
      <div style={hdr}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.2)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}><I.Robot s={20} c="#c9a84c"/></div>
          <div><div style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:700,color:"#f4edd8",letterSpacing:.5}}>AI Application Assistant</div><div style={{fontSize:11,color:"rgba(244,237,216,.45)"}}>{job.title} · {job.company}</div></div>
        </div>
        <button style={xtBtn} onClick={onClose}><I.X s={12} c="currentColor"/></button>
      </div>
      <div style={body}>
        {phase==="check"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          {!profileStr&&<div style={{display:"flex",gap:10,background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.2)",borderRadius:10,padding:"11px 14px"}}>
            <I.Bell s={14} c="#c9a84c"/>
            <div style={{fontSize:12,color:"rgba(244,237,216,.6)"}}>Add skills, work history, and experience to Settings → Resume for personalized results.</div>
          </div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["Cover Letter","XYZ formula tailored to this role",<I.Scroll s={16} c="#c9a84c"/>],["ATS Score","Honest match assessment",<I.Star s={16} c="#c9a84c"/>],["Resume Bullets","Achievements in XYZ format",<I.Lightning s={16} c="#c9a84c"/>],["Interview Prep","5 predicted Q&As",<I.Compass s={16} c="#c9a84c"/>]].map(([lbl,desc,ic])=>
              <div key={lbl} style={{...sec,marginBottom:0,display:"flex",alignItems:"flex-start",gap:10}}>
                {ic}<div><div style={{fontSize:12,fontWeight:600,color:"#f4edd8",marginBottom:2,fontFamily:"'Cinzel',serif"}}>{lbl}</div><div style={{fontSize:11,color:"rgba(244,237,216,.45)"}}>{desc}</div></div>
              </div>)}
          </div>
          {err&&<div style={{fontSize:12,color:"#e07060",background:"rgba(192,50,26,.08)",border:"1px solid rgba(192,50,26,.2)",borderRadius:8,padding:"8px 12px"}}>{err}</div>}
          <button onClick={gen} style={{background:G,border:"none",color:"#0a0608",cursor:"pointer",borderRadius:12,padding:"13px 20px",fontSize:12,fontWeight:800,fontFamily:"'Cinzel',serif",letterSpacing:1,textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",transition:"all .2s"}}><I.Sparkle s={14} c="#0a0608"/>Generate Application Materials</button>
          <p style={{textAlign:"center",fontSize:11,color:"rgba(244,237,216,.35)",fontStyle:"italic",margin:0}}>Powered by Claude AI · Review all materials before submitting.</p>
        </div>}

        {phase==="generating"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"32px 0"}}>
          <I.Sparkle s={32} c="#c9a84c"/>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:700,color:"#f4edd8",textAlign:"center"}}>Crafting your application…</div>
          <p style={{fontSize:12,color:"rgba(244,237,216,.5)",textAlign:"center",fontStyle:"italic",margin:0}}>Analyzing the role and matching your profile.</p>
        </div>}

        {phase==="result"&&result&&<div style={{display:"flex",flexDirection:"column",gap:0}}>
          {/* Match Score */}
          {result.matchScore!=null&&<div style={{...sec,display:"flex",alignItems:"flex-start",gap:14}}>
            <div style={{display:"flex",alignItems:"baseline",gap:2,flexShrink:0}}><span style={{fontFamily:"'Cinzel',serif",fontSize:34,fontWeight:900,color:scoreColor(result.matchScore),lineHeight:1}}>{result.matchScore}</span><span style={{fontSize:13,color:"rgba(244,237,216,.4)"}}>/ 100</span></div>
            <div style={{flex:1,paddingTop:4}}><div style={{height:6,background:"rgba(244,237,216,.08)",borderRadius:3,overflow:"hidden",marginBottom:8}}><div style={{height:"100%",borderRadius:3,background:scoreColor(result.matchScore),width:`${result.matchScore}%`,transition:"width .6s"}}/></div><p style={{fontSize:12,color:"rgba(244,237,216,.6)",fontStyle:"italic",margin:0}}>{result.matchVerdict}</p></div>
          </div>}
          {/* Missing Keywords */}
          {result.missingKeywords?.length>0&&<div style={{...sec,marginBottom:10,borderColor:"rgba(192,50,26,.25)",background:"rgba(192,50,26,.04)"}}>
            <div style={{...secHdr}}><I.Alert s={14}/><span style={{...secTitle,color:"#e07060"}}>Missing ATS Keywords</span></div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{result.missingKeywords.map(k=><span key={k} style={{background:"rgba(192,50,26,.1)",border:"1px solid rgba(192,50,26,.3)",color:"#e07060",borderRadius:20,fontSize:11,padding:"2px 10px",fontFamily:"'Cinzel',serif"}}>{k}</span>)}</div>
          </div>}
          {/* Cover Letter */}
          <div style={sec}><div style={secHdr}><I.Scroll s={14} c="#c9a84c"/><span style={secTitle}>Cover Letter</span><CopyBtn text={result.coverLetter}/></div>
            {result.emailSubject&&<div style={{background:"rgba(201,168,76,.07)",borderRadius:6,padding:"6px 10px",marginBottom:8,fontSize:11,color:"rgba(244,237,216,.7)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}><span><b style={{fontFamily:"'Cinzel',serif"}}>Subject:</b> {result.emailSubject.replace("[Name]",profile.name||"Your Name")}</span><CopyBtn text={result.emailSubject.replace("[Name]",profile.name||"Your Name")}/></div>}
            <p style={{...txt12,whiteSpace:"pre-line"}}>{result.coverLetter}</p>
          </div>
          {/* Resume Bullets */}
          {result.resumeBullets?.length>0&&<div style={sec}><div style={secHdr}><I.Star s={14} c="#c9a84c"/><span style={secTitle}>Resume Bullets (XYZ)</span><CopyBtn text={result.resumeBullets.join("\n")}/></div>
            {result.resumeBullets.map((b,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}><span style={{flexShrink:0,marginTop:2}}><I.Arrow s={11} c="#c9a84c"/></span><span style={txt12}>{b}</span></div>)}
          </div>}
          {/* Strengths */}
          {result.strengthsMatch?.length>0&&<div style={sec}><div style={secHdr}><I.Flame s={14} c="#c9a84c"/><span style={secTitle}>Strengths Match</span></div>
            {result.strengthsMatch.map((s,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:5}}><I.Check s={12} c="#7ecfb3"/><span style={txt12}>{s}</span></div>)}
          </div>}
          {/* Interview Prep */}
          {result.commonQuestions?.length>0&&<div style={sec}><div style={secHdr}><I.Lightning s={14} c="#c9a84c"/><span style={secTitle}>Interview Prep</span></div>
            {result.commonQuestions.map((q,i)=><div key={i} style={{background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.08)",borderRadius:8,padding:"9px 11px",marginBottom:6}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:5}}><span style={{fontSize:12,fontWeight:600,color:"#f4edd8",fontFamily:"'Cinzel',serif"}}>{q.q}</span><CopyBtn text={q.a}/></div>
              <p style={{...txt12,margin:0}}>{q.a}</p>
            </div>)}
          </div>}
          {/* Tips */}
          {result.tips?.length>0&&<div style={sec}><div style={secHdr}><I.Compass s={14} c="#c9a84c"/><span style={secTitle}>Tips</span></div>
            {result.tips.map((t,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:5}}><span style={{color:"#c9a84c",fontWeight:700,flexShrink:0}}>›</span><span style={txt12}>{t}</span></div>)}
          </div>}
          {/* CTA */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"8px 0"}}>
            <button onClick={()=>{window.open(job.url,"_blank");setPhase("done");}} style={{background:G,border:"none",color:"#0a0608",cursor:"pointer",borderRadius:10,padding:"12px 28px",fontSize:12,fontWeight:800,fontFamily:"'Cinzel',serif",letterSpacing:1,textTransform:"uppercase",display:"flex",alignItems:"center",gap:8}}><I.Arrow s={13} c="#0a0608"/>Open Careers Page & Apply</button>
            <p style={{...txt12,textAlign:"center",fontStyle:"italic",maxWidth:360,margin:0}}>Copy your cover letter above, then paste into their application form.</p>
          </div>
        </div>}

        {phase==="done"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"32px 20px",textAlign:"center"}}>
          <div style={{width:60,height:60,borderRadius:"50%",background:"rgba(126,207,179,.1)",border:"1px solid rgba(126,207,179,.3)",display:"flex",alignItems:"center",justifyContent:"center"}}><I.Check s={28} c="#7ecfb3"/></div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:700,color:"#f4edd8"}}>Did you submit your application?</div>
          <p style={{...txt12,margin:0}}>Mark as applied to track it in your Job Applications log.</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{onApplied(job.id);onClose();}} style={{background:"rgba(126,207,179,.15)",border:"1px solid rgba(126,207,179,.35)",color:"#7ecfb3",cursor:"pointer",borderRadius:10,padding:"10px 20px",fontSize:12,fontFamily:"'Cinzel',serif",fontWeight:700,display:"flex",alignItems:"center",gap:6}}><I.Check s={12} c="#0a0608"/>Yes, I Applied!</button>
            <button onClick={onClose} style={{background:"rgba(244,237,216,.04)",border:"1px solid rgba(244,237,216,.1)",color:"rgba(244,237,216,.5)",cursor:"pointer",borderRadius:10,padding:"10px 20px",fontSize:12,fontFamily:"'Cinzel',serif"}}>Not yet</button>
          </div>
        </div>}
      </div>
    </div>
  </div>;
}

// ── AI EMAIL MODAL ────────────────────────────────────────────────────────────
function AIEmailModal({job,user,onClose,onApplied}) {
  const mobile = useIsMobile();
  const [phase,setPhase]=useState("gen");
  const [draft,setDraft]=useState(null);
  const [editBody,setEditBody]=useState("");
  const [editing,setEditing]=useState(false);
  const profile=user?.profile||{};
  const provider=profile.emailProvider||"gmail";
  const toEmail=job.email||`careers@${job.company.toLowerCase().replace(/[^a-z0-9]/g,"")}.com`;
  const fromEmail=profile.emailAddress||user?.email||"";

  const profileStr=[
    profile.name&&`Name: ${profile.name}`,profile.role&&`Role: ${profile.role}`,
    profile.skills&&`Skills: ${profile.skills}`,profile.experience&&`Level: ${profile.experience}`,
    profile.workHistory&&`History: ${profile.workHistory}`,profile.achievements&&`Achievements: ${profile.achievements}`,
  ].filter(Boolean).join("\n");

  useEffect(()=>{
    (async()=>{
      try{
        const etxt=await callAI(`Write a job application email. Return ONLY valid JSON (no markdown fences):\nJOB: ${job.title} at ${job.company}\nSummary: ${job.summary||""}\nAPPLICANT: ${profileStr||"No profile — write a template to customize."}\n{"subject":"concise professional subject line","greeting":"Dear ${job.company} Hiring Team,","body":"3 paragraphs under 250 words: (1) specific hook naming a ${job.company} game or product, (2) 2-3 skills or results matched to their needs, (3) clear ask for an interview. Human tone, not AI-sounding.","closing":"Best regards,","senderName":"${profile.name||"[Your Name]"}"}`,1000);
        const eclean=etxt.replace(/```json|```/g,"").trim();
        const parsed=JSON.parse(eclean.slice(eclean.indexOf("{"),eclean.lastIndexOf("}")+1));
        setDraft(parsed);setEditBody(parsed.body);setPhase("result");
      }catch{setPhase("error");}
    })();
  },[]);

  const fullBody=draft?`${draft.greeting}\n\n${editing?editBody:draft.body}\n\n${draft.closing}\n${draft.senderName}`:"";
  const openProvider=()=>{
    const fn=EMAIL_PROVIDERS[provider]||EMAIL_PROVIDERS.gmail;
    window.open(fn(toEmail,draft?.subject||`Application: ${job.title}`,fullBody),"_blank");
    setPhase("sent");
  };

  const modal={position:"fixed",inset:0,background:"rgba(0,0,0,.85)",backdropFilter:"blur(16px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"};
  const card={background:"rgba(14,10,20,.98)",border:"1px solid rgba(201,168,76,.25)",borderRadius:mobile?14:20,width:"100%",maxWidth:620,maxHeight:"calc(100vh - 32px)",display:"flex",flexDirection:"column",margin:"auto",flexShrink:0,boxShadow:"0 32px 80px rgba(0,0,0,.6)"};
  const txt12={fontSize:12,color:"rgba(244,237,216,.65)",lineHeight:1.6};
  const G="linear-gradient(135deg,#c9a84c,#e8613a)";

  return <div style={modal} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div style={card}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px 14px",borderBottom:"1px solid rgba(201,168,76,.12)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.2)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}><I.Send s={18} c="#c9a84c"/></div>
          <div><div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:700,color:"#f4edd8"}}>AI Email Application</div><div style={{fontSize:11,color:"rgba(244,237,216,.45)"}}>{job.title} · {job.company}</div></div>
        </div>
        <button onClick={onClose} style={{background:"rgba(244,237,216,.06)",border:"1px solid rgba(244,237,216,.1)",color:"rgba(244,237,216,.5)",cursor:"pointer",width:30,height:30,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}><I.X s={12} c="currentColor"/></button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"18px 20px",minHeight:0}}>
        {(phase==="gen")&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"32px 0"}}><I.Sparkle s={28} c="#c9a84c"/><div style={{fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:700,color:"#f4edd8"}}>Drafting your email…</div></div>}
        {phase==="error"&&<div style={{textAlign:"center",padding:"32px 0"}}><p style={{color:"#e07060",fontSize:13}}>Could not generate email. Check your connection and try again.</p></div>}
        {phase==="result"&&draft&&<div>
          {/* Meta */}
          <div style={{background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.1)",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
            {[["To:",toEmail],fromEmail?["From:",fromEmail]:null,["Subject:",draft.subject]].filter(Boolean).map(([lbl,val])=>
              <div key={lbl} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"rgba(201,168,76,.6)",textTransform:"uppercase",letterSpacing:.8,width:48,flexShrink:0}}>{lbl}</span>
                <span style={{fontSize:12,color:"rgba(244,237,216,.8)",flex:1}}>{val}</span>
                {lbl==="Subject:"&&<CopyBtn text={draft.subject}/>}
              </div>)}
          </div>
          {/* Body */}
          <div style={{background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.1)",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"#c9a84c"}}>Email Body</span>
              <div style={{display:"flex",gap:6}}><CopyBtn text={fullBody} label="Copy All"/><button onClick={()=>setEditing(e=>!e)} style={{background:"rgba(244,237,216,.06)",border:"1px solid rgba(244,237,216,.1)",color:"rgba(244,237,216,.5)",cursor:"pointer",borderRadius:6,fontSize:11,padding:"3px 10px",fontFamily:"inherit"}}>{editing?"Done":"Edit"}</button></div>
            </div>
            <div style={{background:"rgba(0,0,0,.2)",borderRadius:8,padding:"12px 14px"}}>
              <p style={{...txt12,fontWeight:600,margin:"0 0 8px"}}>{draft.greeting}</p>
              {editing?<textarea value={editBody} onChange={e=>setEditBody(e.target.value)} rows={8} style={{width:"100%",background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.18)",color:"#f4edd8",borderRadius:8,padding:"10px 12px",fontSize:12,fontFamily:"inherit",resize:"vertical",boxSizing:"border-box"}}/>:<p style={{...txt12,whiteSpace:"pre-line",margin:"0 0 8px"}}>{draft.body}</p>}
              <p style={{...txt12,margin:0}}>{draft.closing}<br/>{draft.senderName}</p>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <button onClick={openProvider} style={{background:G,border:"none",color:"#0a0608",cursor:"pointer",borderRadius:10,padding:"12px 28px",fontSize:12,fontWeight:800,fontFamily:"'Cinzel',serif",letterSpacing:1,textTransform:"uppercase",display:"flex",alignItems:"center",gap:8}}><I.Send s={13} c="#0a0608"/>Open in {PROVIDER_LABELS[provider]||"Email"}</button>
            <p style={{...txt12,textAlign:"center",fontStyle:"italic",margin:0,maxWidth:360}}>Pre-fills a compose window. Review, attach resume, then send.</p>
          </div>
        </div>}
        {phase==="sent"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"32px 20px",textAlign:"center"}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(126,207,179,.1)",border:"1px solid rgba(126,207,179,.3)",display:"flex",alignItems:"center",justifyContent:"center"}}><I.Send s={24} c="#7ecfb3"/></div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:700,color:"#f4edd8"}}>Email client opened!</div>
          <p style={{fontSize:12,color:"rgba(244,237,216,.55)",margin:0}}>Review the draft, attach your resume, and hit Send. Did you submit?</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{onApplied(job.id);onClose();}} style={{background:"rgba(126,207,179,.15)",border:"1px solid rgba(126,207,179,.35)",color:"#7ecfb3",cursor:"pointer",borderRadius:10,padding:"10px 20px",fontSize:12,fontFamily:"'Cinzel',serif",fontWeight:700,display:"flex",alignItems:"center",gap:6}}><I.Check s={12} c="#0a0608"/>Yes, Sent It!</button>
            <button onClick={onClose} style={{background:"rgba(244,237,216,.04)",border:"1px solid rgba(244,237,216,.1)",color:"rgba(244,237,216,.5)",cursor:"pointer",borderRadius:10,padding:"10px 20px",fontSize:12,fontFamily:"'Cinzel',serif"}}>Not yet</button>
          </div>
        </div>}
      </div>
    </div>
  </div>;
}


// ── RESUME SECTION ────────────────────────────────────────────────────────────
function ResumeSection({profile,updateField}) {
  const mobile = useIsMobile();
  const [ps,setPs]=useState("idle");
  const [msg,setMsg]=useState("");
  const fileRef=useRef(null);

  const toB64=(file)=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});

  const upload=async(e)=>{
    const file=e.target.files?.[0]; if(!file)return;
    const ext="."+file.name.split(".").pop().toLowerCase();
    if(![".pdf",".docx",".doc",".txt"].includes(ext)){setMsg("Use PDF, DOCX, or TXT.");setPs("error");return;}
    if(file.size>10*1024*1024){setMsg("File must be under 10MB.");setPs("error");return;}
    setPs("reading");setMsg("Reading file…");
    try{
      let messages,headers={"Content-Type":"application/json"};
      let pdfB64="",pdfExtractPrompt=""; // declared here so they're accessible after the if/else
      if(ext===".pdf"){
        setMsg("Processing PDF…");
        pdfB64=await toB64(file);
        pdfExtractPrompt=`Extract all resume information. Return ONLY valid JSON (no markdown, no explanation):\n{"name":"full name","role":"current or target job title","location":"city, state","bio":"2-sentence professional summary","skills":"comma-separated list of all skills","yearsExp":"best match: 0-1, 1-2, 2-4, 4-7, 7-10, or 10+","education":"degree, school, year","workHistory":"chronological summary of each role with dates","achievements":"measurable accomplishments with numbers","resumeText":"complete verbatim resume text"}`;
        messages=[{role:"user",content:pdfExtractPrompt}];
      } else {
        setMsg(ext===".txt"?"Reading text…":"Extracting DOCX text…");
        let text="";
        if(ext===".txt"){
          text=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsText(file);});
        } else {
          // DOCX: load mammoth dynamically
          if(typeof window.mammoth==="undefined"){
            await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});
          }
          const buf=await new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.onerror=rej;r.readAsArrayBuffer(file);});
          const result=await window.mammoth.extractRawText({arrayBuffer:buf});
          text=result.value||"";
          if(text.length<20){throw new Error("Could not extract text. Try saving as PDF.");}
        }
        const extractPrompt=`Extract resume info. Return ONLY valid JSON (no markdown):\n{"name":"","role":"job title","location":"city, state","bio":"2-sentence summary","skills":"comma-separated skills","yearsExp":"0-1|1-2|2-4|4-7|7-10|10+","education":"degree, school, year","workHistory":"summary of each role","achievements":"measurable wins","resumeText":"full text"}\n\nRESUME:\n${text.slice(0,10000)}`;
        messages=[{role:"user",content:extractPrompt}];
      }
      setPs("parsing");setMsg("Extracting resume info with AI…");
      // PDF uses Gemini inline_data; DOCX/TXT use callAI text
      let parsedText;
      if(ext===".pdf"){
        const gemKey=process.env.NEXT_PUBLIC_GEMINI_KEY;
        if(!gemKey)throw new Error("Missing NEXT_PUBLIC_GEMINI_KEY. Get a free key at aistudio.google.com");
        const pdfRes=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${gemKey}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{inline_data:{mime_type:"application/pdf",data:pdfB64}},{text:pdfExtractPrompt}]}],generationConfig:{maxOutputTokens:1500,temperature:0.1}})});
        if(!pdfRes.ok){const pe=await pdfRes.json().catch(()=>({}));throw new Error(pe?.error?.message||`PDF API error ${pdfRes.status}`);}
        const pdfData=await pdfRes.json();
        parsedText=(pdfData.candidates?.[0]?.content?.parts?.[0]?.text||"").replace(/```json|```/g,"").trim();
      } else {
        parsedText=(await callAI(messages[0].content,1500)).replace(/```json|```/g,"").trim();
      }
      const parsed=JSON.parse(parsedText.slice(parsedText.indexOf("{"),parsedText.lastIndexOf("}")+1));
      Object.entries(parsed).forEach(([k,v])=>{if(v&&typeof v==="string"&&v.trim())updateField(k,v.trim());});
      setPs("done");setMsg("Resume parsed! Review and edit the fields below.");
    }catch(err){setPs("error");setMsg(err.message||"Could not parse. Try a different file or paste text manually.");}
    if(fileRef.current)fileRef.current.value="";
  };

  const inp={background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.18)",color:"#f4edd8",borderRadius:8,padding:"8px 12px",fontSize:12,fontFamily:"inherit",width:"100%",boxSizing:"border-box"};
  const lbl={fontSize:10,color:"rgba(201,168,76,.7)",textTransform:"uppercase",letterSpacing:.8,fontFamily:"'Cinzel',serif",marginBottom:4,display:"block"};
  const fld={display:"flex",flexDirection:"column",gap:4,marginBottom:12};
  const G="linear-gradient(135deg,#c9a84c,#e8613a)";
  const zoneColor=ps==="done"?"rgba(126,207,179,.35)":ps==="error"?"rgba(192,50,26,.35)":"rgba(201,168,76,.25)";
  const zoneBg=ps==="done"?"rgba(126,207,179,.04)":ps==="error"?"rgba(192,50,26,.04)":"rgba(201,168,76,.03)";
  const msgColor=ps==="done"?"#7ecfb3":ps==="error"?"#e07060":"rgba(244,237,216,.7)";

  return <div>
    <p style={{fontSize:12,color:"rgba(244,237,216,.5)",fontStyle:"italic",marginBottom:14}}>Upload your resume to auto-fill all fields, or fill them in manually. This powers the AI Application Assistant.</p>
    <div onClick={()=>ps!=="parsing"&&ps!=="reading"&&fileRef.current?.click()} onDragOver={e=>{e.preventDefault();}} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f){const dt=new DataTransfer();dt.items.add(f);fileRef.current.files=dt.files;upload({target:fileRef.current});}}} style={{border:`1.5px dashed ${zoneColor}`,borderRadius:12,padding:"24px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:8,cursor:ps==="parsing"||ps==="reading"?"default":"pointer",transition:"all .2s",background:zoneBg,marginBottom:16,textAlign:"center"}}>
      <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" style={{display:"none"}} onChange={upload}/>
      {ps==="idle"&&<><I.Scroll s={26} c="#c9a84c"/><div style={{fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:700,color:"#f4edd8"}}>Upload Resume</div><div style={{fontSize:11,color:"rgba(244,237,216,.4)"}}>PDF, DOCX, or TXT · Max 10MB</div><div style={{background:G,border:"none",color:"#0a0608",borderRadius:8,padding:"7px 18px",fontSize:11,fontWeight:700,fontFamily:"'Cinzel',serif",cursor:"pointer",marginTop:4}}>Choose File or Drag & Drop</div></>}
      {(ps==="reading"||ps==="parsing")&&<><I.Sparkle s={26} c="#c9a84c"/><div style={{fontSize:12,color:"rgba(244,237,216,.7)",fontFamily:"'Cinzel',serif"}}>{msg}</div></>}
      {ps==="done"&&<><I.Check s={26} c="#7ecfb3"/><div style={{fontSize:12,fontFamily:"'Cinzel',serif",color:"#7ecfb3"}}>{msg}</div><button onClick={e=>{e.stopPropagation();setPs("idle");setMsg("");}} style={{background:"rgba(244,237,216,.06)",border:"1px solid rgba(244,237,216,.1)",color:"rgba(244,237,216,.5)",cursor:"pointer",borderRadius:8,fontSize:11,padding:"5px 14px",fontFamily:"inherit"}}>Upload a different file</button></>}
      {ps==="error"&&<><I.X s={26} c="#e07060"/><div style={{fontSize:12,color:"#e07060",fontFamily:"'Cinzel',serif"}}>{msg}</div><div style={{background:G,border:"none",color:"#0a0608",borderRadius:8,padding:"7px 18px",fontSize:11,fontWeight:700,fontFamily:"'Cinzel',serif",cursor:"pointer"}}>Try Again</div></>}
    </div>
    <div style={fld}><label style={lbl}>Key Skills</label><textarea style={{...inp,minHeight:70,resize:"vertical"}} value={profile.skills||""} onChange={e=>updateField("skills",e.target.value)} placeholder="e.g. Unreal Engine 5, C++, Blueprint scripting, multiplayer..."/></div>
    <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:12,marginBottom:12}}>
      <div style={fld}><label style={lbl}>Years of Experience</label><select style={inp} value={profile.yearsExp||""} onChange={e=>updateField("yearsExp",e.target.value)}><option value="">Select</option>{["0-1","1-2","2-4","4-7","7-10","10+"].map(v=><option key={v} value={v}>{v} years</option>)}</select></div>
      <div style={fld}><label style={lbl}>Target Salary</label><input style={inp} value={profile.targetSalary||""} onChange={e=>updateField("targetSalary",e.target.value)} placeholder="e.g. $90k–$120k"/></div>
    </div>
    <div style={fld}><label style={lbl}>Education</label><input style={inp} value={profile.education||""} onChange={e=>updateField("education",e.target.value)} placeholder="e.g. BS Computer Science, DigiPen, 2022"/></div>
    <div style={fld}><label style={lbl}>Work History Summary</label><textarea style={{...inp,minHeight:80,resize:"vertical"}} value={profile.workHistory||""} onChange={e=>updateField("workHistory",e.target.value)} placeholder="e.g. Junior Programmer at Studio X (2022–2024): shipped 2 mobile titles..."/></div>
    <div style={fld}><label style={lbl}>Key Achievements</label><textarea style={{...inp,minHeight:70,resize:"vertical"}} value={profile.achievements||""} onChange={e=>updateField("achievements",e.target.value)} placeholder="e.g. Reduced load times 40%, shipped game with 50k downloads..."/></div>
    <div style={fld}><label style={lbl}>Full Resume Text</label><textarea style={{...inp,minHeight:90,resize:"vertical"}} value={profile.resumeText||""} onChange={e=>updateField("resumeText",e.target.value)} placeholder="Auto-filled from upload, or paste here manually."/></div>
  </div>;
}

// ── ACCOUNT PANEL ─────────────────────────────────────────────────────────────
function AccountPanel({user,onClose,onUpdate,onLogout}) {
  const mobile = useIsMobile();
  const [tab,setTab]=useState("profile");
  const [p,setP]=useState({name:user.name||"",bio:user.profile?.bio||"",location:user.profile?.location||"",linkedin:user.profile?.linkedin||"",portfolio:user.profile?.portfolio||"",github:user.profile?.github||"",role:user.profile?.role||"",experience:user.profile?.experience||"",openTo:user.profile?.openTo||[],skills:user.profile?.skills||"",yearsExp:user.profile?.yearsExp||"",education:user.profile?.education||"",workHistory:user.profile?.workHistory||"",achievements:user.profile?.achievements||"",targetSalary:user.profile?.targetSalary||"",resumeText:user.profile?.resumeText||"",emailAddress:user.profile?.emailAddress||"",emailProvider:user.profile?.emailProvider||"gmail",notifications:user.profile?.notifications!==false,emailAlerts:user.profile?.emailAlerts||false});
  const [saved,setSaved]=useState(false);
  const upd=(k,v)=>setP(prev=>({...prev,[k]:v}));
  const toggleOt=(v)=>setP(prev=>({...prev,openTo:prev.openTo.includes(v)?prev.openTo.filter(x=>x!==v):[...prev.openTo,v]}));
  const save = async () => {
    if (user?.id) {
      await supabase.from("profiles").upsert({ id: user.id, name: p.name, role: p.role, location: p.location, skills: p.skills, years_exp: p.yearsExp, education: p.education, work_history: p.workHistory, achievements: p.achievements, resume_text: p.resumeText, email_provider: p.emailProvider, email_address: p.emailAddress, open_to: p.openTo }, { onConflict: "id" });
    }
    onUpdate({ ...user, name: p.name, profile: p });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const initials=p.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"?";
  const G="linear-gradient(135deg,#c9a84c,#e8613a)";
  const inp={background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.18)",color:"#f4edd8",borderRadius:8,padding:"8px 12px",fontSize:12,fontFamily:"inherit",width:"100%",boxSizing:"border-box"};
  const lbl={fontSize:10,color:"rgba(201,168,76,.7)",textTransform:"uppercase",letterSpacing:.8,fontFamily:"'Cinzel',serif",marginBottom:4,display:"block"};
  const fld={display:"flex",flexDirection:"column",gap:4,marginBottom:12};
  const tabs=[["profile","Profile",<I.Person s={14} c="currentColor"/>],["resume","Resume",<I.Scroll s={14} c="currentColor"/>],["links","Links",<I.Link s={14} c="currentColor"/>],["prefs","Prefs",<I.Cog s={14} c="currentColor"/>],["account","Account",<I.Lock s={14} c="currentColor"/>]];

  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",justifyContent:"flex-end",alignItems:"stretch",flexDirection:"row"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div style={{width:"100%",maxWidth:mobile?380:460,height:"100vh",background:"rgba(10,7,14,.97)",borderLeft:"1px solid rgba(201,168,76,.18)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"18px 18px 14px",borderBottom:"1px solid rgba(201,168,76,.1)",flexShrink:0}}>
        <div style={{width:42,height:42,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#0a0608",fontFamily:"'Cinzel',serif",flexShrink:0}}>{initials}</div>
        <div style={{flex:1}}><div style={{fontFamily:"'Cinzel',serif",fontWeight:600,fontSize:14,color:"#f4edd8"}}>{p.name||"Your Name"}</div><div style={{fontSize:11,color:"rgba(244,237,216,.4)"}}>{user.email}</div></div>
        <button onClick={onClose} style={{background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.15)",color:"rgba(244,237,216,.5)",cursor:"pointer",width:30,height:30,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}><I.X s={12} c="currentColor"/></button>
      </div>
      {/* Tab nav */}
      <div style={{display:"flex",padding:"6px 10px",gap:2,borderBottom:"1px solid rgba(201,168,76,.07)",flexShrink:0,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        {tabs.map(([id,label,icon])=><button key={id} onClick={()=>setTab(id)} style={{flex:1,minWidth:mobile?56:0,background:tab===id?"rgba(201,168,76,.1)":"none",border:"none",cursor:"pointer",color:tab===id?"#c9a84c":"rgba(244,237,216,.4)",fontSize:9,padding:"7px 3px",borderRadius:8,display:"flex",flexDirection:"column",alignItems:"center",gap:3,fontFamily:"'Cinzel',serif",letterSpacing:.3,transition:"all .15s"}}>{icon}{label}</button>)}
      </div>
      {/* Body */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 18px",minHeight:0}}>
        {tab==="profile"&&<div>
          <div style={{width:56,height:56,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:"#0a0608",fontFamily:"'Cinzel',serif",margin:"0 auto 16px"}}>{initials}</div>
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:12,marginBottom:12}}><div style={fld}><label style={lbl}>Display Name</label><input style={inp} value={p.name} onChange={e=>upd("name",e.target.value)} placeholder="Your name"/></div><div style={fld}><label style={lbl}>Location</label><input style={inp} value={p.location} onChange={e=>upd("location",e.target.value)} placeholder="City, State"/></div></div>
          <div style={fld}><label style={lbl}>Target Role</label><input style={inp} value={p.role} onChange={e=>upd("role",e.target.value)} placeholder="e.g. Game Designer, Software Engineer"/></div>
          <div style={fld}><label style={lbl}>Experience Level</label><select style={inp} value={p.experience} onChange={e=>upd("experience",e.target.value)}><option value="">Select</option><option>Entry Level (0–2 yrs)</option><option>Mid Level (2–5 yrs)</option><option>Senior (5–10 yrs)</option><option>Principal / Lead (10+ yrs)</option></select></div>
          <div style={fld}><label style={lbl}>Bio</label><textarea style={{...inp,minHeight:70,resize:"vertical"}} value={p.bio} onChange={e=>upd("bio",e.target.value)} placeholder="Short professional summary..."/></div>
          <div style={fld}><label style={lbl}>Open To</label><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{["Full-time","Contract","Remote","Hybrid","On-site","Relocation"].map(opt=><button key={opt} onClick={()=>toggleOt(opt)} style={{background:p.openTo.includes(opt)?"rgba(201,168,76,.18)":"rgba(244,237,216,.05)",border:`1px solid ${p.openTo.includes(opt)?"rgba(201,168,76,.4)":"rgba(244,237,216,.1)"}`,color:p.openTo.includes(opt)?"#f0d080":"rgba(244,237,216,.5)",cursor:"pointer",borderRadius:20,fontSize:11,padding:"4px 14px",fontFamily:"inherit"}}>{opt}</button>)}</div></div>
        </div>}
        {tab==="resume"&&<ResumeSection profile={p} updateField={upd}/>}
        {tab==="links"&&<div>
          <p style={{fontSize:12,color:"rgba(244,237,216,.5)",fontStyle:"italic",marginBottom:14}}>Professional links and email settings for AI-drafted email applications.</p>
          {[["linkedin","LinkedIn",<I.Globe s={12} c="currentColor"/>,"https://linkedin.com/in/yourname"],["portfolio","Portfolio",<I.Globe s={12} c="currentColor"/>,"https://yourportfolio.com"],["github","GitHub",<I.Link s={12} c="currentColor"/>,"https://github.com/yourhandle"]].map(([k,label,icon,ph])=>
            <div key={k} style={fld}><label style={{...lbl,display:"flex",alignItems:"center",gap:6}}>{icon}{label}</label><input style={inp} value={p[k]||""} onChange={e=>upd(k,e.target.value)} placeholder={ph}/></div>)}
          <div style={{height:1,background:"rgba(201,168,76,.1)",margin:"16px 0"}}/>
          <div style={{display:"flex",gap:8,background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.14)",borderRadius:8,padding:"10px 12px",marginBottom:14,alignItems:"flex-start"}}>
            <I.Send s={13} c="#c9a84c"/><span style={{fontSize:11,color:"rgba(244,237,216,.55)"}}>Used to draft AI email applications. Your email is never sent automatically — you always review first.</span>
          </div>
          <div style={fld}><label style={lbl}>Your Email Address</label><input style={inp} type="email" value={p.emailAddress||""} onChange={e=>upd("emailAddress",e.target.value)} placeholder="you@email.com"/></div>
          <div style={fld}><label style={lbl}>Preferred Email Provider</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:2}}>{[["gmail","Gmail"],["outlook","Outlook"],["yahoo","Yahoo Mail"],["proton","ProtonMail"]].map(([id,label])=><button key={id} onClick={()=>upd("emailProvider",id)} style={{background:p.emailProvider===id?"rgba(201,168,76,.15)":"rgba(244,237,216,.04)",border:`1px solid ${p.emailProvider===id?"rgba(201,168,76,.4)":"rgba(244,237,216,.1)"}`,color:p.emailProvider===id?"#f0d080":"rgba(244,237,216,.5)",cursor:"pointer",borderRadius:8,padding:"8px 12px",fontSize:12,fontFamily:"'Cinzel',serif",display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>{p.emailProvider===id&&<I.Check s={11} c="#0a0608"/>}{label}</button>)}</div></div>
        </div>}
        {tab==="prefs"&&<div>
          {[["notifications","In-app Notifications","Show alerts for new postings"],["emailAlerts","Email Alerts","Get notified by email for new postings"]].map(({0:k,1:label,2:desc})=>
            <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:14,background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.08)",borderRadius:10,marginBottom:10}}>
              <div><div style={{fontSize:13,fontWeight:500,color:"#f4edd8",marginBottom:2}}>{label}</div><div style={{fontSize:11,color:"rgba(244,237,216,.4)"}}>{desc}</div></div>
              <button onClick={()=>upd(k,!p[k])} style={{width:42,height:24,background:p[k]?"#c9a84c":"rgba(244,237,216,.08)",border:"none",borderRadius:12,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
                <div style={{position:"absolute",width:18,height:18,background:"#f4edd8",borderRadius:"50%",top:3,left:3,transition:"transform .2s",transform:p[k]?"translateX(18px)":"none"}}/>
              </button>
            </div>)}
        </div>}
        {tab==="account"&&<div>
          {[["Email",user.email],["Applications Tracked",Object.keys(user.applied||{}).length]].map(([l,v])=>
            <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid rgba(201,168,76,.07)"}}><span style={{fontSize:12,color:"rgba(244,237,216,.5)",fontFamily:"'Cinzel',serif"}}>{l}</span><span style={{fontSize:13,color:"#f4edd8",fontWeight:500}}>{v}</span></div>)}
          <div style={{marginTop:20,padding:14,background:"rgba(192,50,26,.05)",border:"1px solid rgba(192,50,26,.2)",borderRadius:10}}>
            <div style={{fontSize:11,color:"#e07060",fontFamily:"'Cinzel',serif",fontWeight:600,marginBottom:10,letterSpacing:.5}}>⚠ Danger Zone</div>
            <button onClick={async ()=>{if(window.confirm("Clear all tracked applications?")){if(user?.id){await supabase.from("applications").delete().eq("user_id",user.id);}onUpdate({...user,applied:{}});}}} style={{background:"rgba(192,50,26,.1)",border:"1px solid rgba(192,50,26,.3)",color:"#e07060",cursor:"pointer",fontSize:12,padding:"7px 16px",borderRadius:8,fontFamily:"inherit"}}>Clear All Applications</button>
          </div>
          <button onClick={onLogout} style={{width:"100%",marginTop:10,background:"rgba(244,237,216,.04)",border:"1px solid rgba(201,168,76,.14)",color:"rgba(244,237,216,.5)",cursor:"pointer",fontSize:12,padding:10,borderRadius:10,fontFamily:"'Cinzel',serif",fontWeight:600,letterSpacing:.5}}>Sign Out of Main Quest</button>
        </div>}
      </div>
      {/* Footer */}
      <div style={{padding:"12px 18px",borderTop:"1px solid rgba(201,168,76,.1)",flexShrink:0}}>
        <button onClick={save} style={{width:"100%",background:G,border:"none",color:"#0a0608",cursor:"pointer",fontSize:12,fontWeight:800,padding:12,borderRadius:10,fontFamily:"'Cinzel',serif",letterSpacing:1,textTransform:"uppercase",transition:"all .2s"}}>{saved?"✓ Saved!":"Save Changes"}</button>
      </div>
    </div>
  </div>;
}

// ── NO OPENINGS CARD ──────────────────────────────────────────────────────────
function NoOpenCard({company,companyName,user,onApplied}) {
  const [showEmail,setShowEmail]=useState(false);
  const synthetic={id:`noop-${companyName}`,title:"General Application",company:companyName,url:company.url,applyUrl:company.url,email:company.email||`careers@${companyName.toLowerCase().replace(/[^a-z0-9]/g,"")}.com`,summary:`Open application to ${companyName}.`,responsibilities:[],requirements:[],experience:"",type:"Full-time",salary:"",isRemote:false,isVolunteer:!!company.volunteer};
  const btn=(lbl,icon,onClick,style={})=><button onClick={onClick} style={{background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.25)",color:"#f0d080",cursor:"pointer",borderRadius:7,padding:"5px 11px",fontSize:10,fontFamily:"'Cinzel',serif",fontWeight:700,display:"inline-flex",alignItems:"center",gap:5,transition:"all .15s",...style}}>{icon}{lbl}</button>;
  return <>
    <div style={{background:"rgba(201,168,76,.03)",border:"1px dashed rgba(201,168,76,.15)",borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:12}}>
      <I.Scroll s={18} c="rgba(201,168,76,.45)"/>
      <div style={{flex:1}}><p style={{fontSize:12,fontWeight:600,color:"rgba(244,237,216,.6)",margin:"0 0 2px"}}>No current listings — they may still be hiring.</p><p style={{fontSize:11,color:"rgba(244,237,216,.4)",margin:0}}>Visit their careers page or send a general application email.</p></div>
      <div style={{display:"flex",flexDirection:"column",gap:5,flexShrink:0}}>
        <a href={company.url} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>{btn("Careers",<I.Arrow s={10} c="#f0d080"/>,(()=>{}))}</a>
        {btn("AI Email",<I.Send s={10} c="#e8a070"/>,(()=>setShowEmail(true)),{background:"rgba(232,97,58,.1)",border:"1px solid rgba(232,97,58,.3)",color:"#e8a070"})}
      </div>
    </div>
    {showEmail&&<AIEmailModal job={synthetic} user={user} onClose={()=>setShowEmail(false)} onApplied={onApplied}/>}
  </>;
}

// ── ATS SCORER ───────────────────────────────────────────────────────────────
function computeATS(job,profile){
  if(!profile)return null;
  const text=[profile.skills||"",profile.bio||"",profile.workHistory||"",profile.achievements||"",profile.role||"",profile.resumeText||""].join(" ").toLowerCase();
  if(!text.trim()||text.length<30)return null;
  const jobText=[job.title||"",job.summary||"",...(job.responsibilities||[]),...(job.requirements||[])].join(" ").toLowerCase();
  const STOP=new Set(["and","the","for","with","this","that","are","you","will","have","from","our","your","able","more","some","they","into","its","can","use","all","any","work","team","years","role","to","in","of","a","an","or","on","at","by","as","be","is","it","do","we"]);
  const kws=[...new Set((jobText.match(/[a-z][a-z+#.]{2,}/g)||[]).filter(w=>!STOP.has(w)))];
  if(!kws.length)return null;
  const profileSet=new Set((text.match(/[a-z][a-z+#.]{2,}/g)||[]).filter(w=>!STOP.has(w)));
  const matched=kws.filter(k=>profileSet.has(k));
  const pct=Math.round((matched.length/Math.min(kws.length,60))*100);
  const seed=job.id.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const score=Math.min(96,Math.max(8,pct+((seed%17)-8)));
  const potential=Math.min(97,score+8+(seed%9));
  const missing=kws.filter(k=>!profileSet.has(k)&&k.length>4).slice(0,5);
  return{score,potential,missing};
}
function ATSPill({ats,onClick}){
  if(!ats)return null;
  const{score,potential}=ats;
  const col=score>=70?"#7ecfb3":score>=45?"#c9a84c":"#e07060";
  const bg=score>=70?"rgba(126,207,179,.1)":score>=45?"rgba(201,168,76,.1)":"rgba(192,50,26,.1)";
  const br=score>=70?"rgba(126,207,179,.3)":score>=45?"rgba(201,168,76,.3)":"rgba(192,50,26,.3)";
  return <button onClick={onClick} title={`ATS Match: ${score}/100 — click AI Apply to improve`} style={{display:"inline-flex",alignItems:"center",gap:3,background:bg,border:`1px solid ${br}`,color:col,borderRadius:20,padding:"2px 9px",cursor:"pointer",flexShrink:0,marginLeft:"auto",fontFamily:"'Cinzel',serif"}}>
    <span style={{fontSize:12,fontWeight:800,lineHeight:1}}>{score}</span>
    <span style={{fontSize:9,opacity:.7}}>ATS</span>
    {potential>score&&<span style={{fontSize:9,opacity:.55,borderLeft:`1px solid ${col}`,paddingLeft:4,marginLeft:2}}>↑{potential}</span>}
  </button>;
}

// ── JOB CARD ──────────────────────────────────────────────────────────────────
function JobCard({job,user,onApplied}) {
  const mobile = useIsMobile();
  const [prompt,setPrompt]=useState(false);
  const [expanded,setExpanded]=useState(false);
  const [aiApply,setAiApply]=useState(false);
  const [aiEmail,setAiEmail]=useState(false);
  const isApplied=user?.applied?.[job.id];
  const EXP_COLOR={"Entry Level":{bg:"rgba(78,240,197,.1)",br:"rgba(78,240,197,.25)",c:"#4ef0c5"},"Mid Level":{bg:"rgba(124,111,255,.1)",br:"rgba(124,111,255,.25)",c:"#a99fff"},"Senior":{bg:"rgba(255,111,176,.1)",br:"rgba(255,111,176,.25)",c:"#ff6fb0"},"Lead":{bg:"rgba(255,180,50,.1)",br:"rgba(255,180,50,.25)",c:"#ffb432"},"Principal":{bg:"rgba(255,140,80,.1)",br:"rgba(255,140,80,.25)",c:"#ff9a50"},"Director":{bg:"rgba(220,80,255,.1)",br:"rgba(220,80,255,.25)",c:"#dc50ff"}};
  const ec=EXP_COLOR[job.experience]||{bg:"rgba(244,237,216,.06)",br:"rgba(244,237,216,.12)",c:"rgba(244,237,216,.5)"};
  const onApply=()=>{window.open(job.url,"_blank");setTimeout(()=>setPrompt(true),2500);};
  const confirm=(yes)=>{setPrompt(false);if(yes)onApplied(job.id);};
  const G="linear-gradient(135deg,#c9a84c,#e8613a)";
  const chip=(children,style={})=><span style={{background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.15)",borderRadius:20,fontSize:10,padding:"2px 9px",color:"rgba(244,237,216,.65)",...style}}>{children}</span>;
  return <div style={{background:"rgba(16,10,22,.6)",border:`1px solid ${isApplied?"rgba(126,207,179,.3)":job.isNew?"rgba(192,50,26,.35)":"rgba(201,168,76,.12)"}`,borderRadius:10,padding:"13px 15px",transition:"all .2s",cursor:"default"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(201,168,76,.05)";e.currentTarget.style.transform="translateX(3px)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(16,10,22,.6)";e.currentTarget.style.transform="";}}>
    {/* Title row */}
    {(()=>{const ats=computeATS(job,user?.profile);return(
    <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:7}}>
      {job.isNew&&<I.Alert s={18}/>}
      <span style={{fontSize:14,fontWeight:600,color:"#f4edd8"}}>{job.title}</span>
      {job.isVolunteer?<span style={{background:"rgba(126,207,179,.12)",border:"1px solid rgba(126,207,179,.3)",color:"#7ecfb3",borderRadius:20,fontSize:10,padding:"2px 9px",fontFamily:"'Cinzel',serif",fontWeight:700}}>Volunteer</span>:<span style={{background:ec.bg,border:`1px solid ${ec.br}`,color:ec.c,borderRadius:20,fontSize:10,padding:"2px 9px",fontFamily:"'Cinzel',serif",fontWeight:700,flexShrink:0}}>{job.experience}</span>}
      {isApplied&&<span style={{background:"rgba(126,207,179,.12)",border:"1px solid rgba(126,207,179,.3)",color:"#7ecfb3",borderRadius:20,fontSize:10,padding:"2px 9px",fontWeight:600}}><I.Check s={10} c="#7ecfb3"/> Applied</span>}
      <ATSPill ats={ats} onClick={()=>setAiApply(true)}/>
    </div>
    );})()}
    {/* Meta chips */}
    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:7}}>
      {chip(job.type)}
      {job.isRemote&&chip("Remote OK",{background:"rgba(126,207,179,.08)",border:"1px solid rgba(126,207,179,.2)",color:"#7ecfb3"})}
      {job.salary&&chip(job.salary,{background:"rgba(232,97,58,.08)",border:"1px solid rgba(232,97,58,.2)",color:"#e8b070"})}
      {chip(`Posted ${job.postedStr}`,{color:"rgba(244,237,216,.4)"})}
    </div>
    {/* Summary */}
    {job.summary&&<p style={{fontSize:12,color:"rgba(244,237,216,.6)",lineHeight:1.5,fontStyle:"italic",margin:"0 0 7px"}}>{job.summary}</p>}
    {/* Expand */}
    <button onClick={()=>setExpanded(e=>!e)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(201,168,76,.55)",fontSize:11,fontFamily:"'Cinzel',serif",display:"flex",alignItems:"center",gap:5,padding:"3px 0",marginBottom:7,letterSpacing:.3}}>
      <span>{expanded?"Hide details":"View description & requirements"}</span>
      <span style={{display:"inline-block",transition:"transform .2s",transform:expanded?"rotate(180deg)":"none",fontSize:13}}>▾</span>
    </button>
    {expanded&&<div style={{background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.1)",borderRadius:8,padding:"12px 14px",marginBottom:8}}>
      {job.responsibilities?.length>0&&<><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"#c9a84c",fontFamily:"'Cinzel',serif",marginBottom:6}}>Responsibilities</div>{job.responsibilities.map((r,i)=><div key={i} style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:4}}><span style={{color:"#c9a84c",fontWeight:700,flexShrink:0}}>›</span><span style={{fontSize:12,color:"rgba(244,237,216,.65)",lineHeight:1.5}}>{r}</span></div>)}</>}
      {job.requirements?.length>0&&<><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"#c9a84c",fontFamily:"'Cinzel',serif",marginBottom:6,marginTop:job.responsibilities?.length>0?10:0}}>Requirements</div>{job.requirements.map((r,i)=><div key={i} style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:4}}><span style={{color:"#c9a84c",fontWeight:700,flexShrink:0}}>›</span><span style={{fontSize:12,color:"rgba(244,237,216,.65)",lineHeight:1.5}}>{r}</span></div>)}</>}
      {(!job.responsibilities?.length&&!job.requirements?.length)&&<><p style={{fontSize:12,color:"rgba(244,237,216,.4)",fontStyle:"italic",margin:"0 0 8px"}}>Visit the careers page for the full job description.</p><a href={job.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#c9a84c",textDecoration:"none",fontFamily:"'Cinzel',serif"}}>View Full Posting →</a></>}
    </div>}
    {/* Apply prompt */}
    {prompt&&<div style={{background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",borderRadius:8,padding:"9px 13px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8,fontSize:12,color:"rgba(244,237,216,.7)"}}>
      Did you apply?
      <button onClick={()=>confirm(true)} style={{background:"rgba(126,207,179,.15)",border:"1px solid rgba(126,207,179,.35)",color:"#7ecfb3",cursor:"pointer",borderRadius:6,fontSize:11,padding:"4px 12px",fontFamily:"'Cinzel',serif"}}>Yes!</button>
      <button onClick={()=>confirm(false)} style={{background:"rgba(244,237,216,.05)",border:"1px solid rgba(244,237,216,.1)",color:"rgba(244,237,216,.4)",cursor:"pointer",borderRadius:6,fontSize:11,padding:"4px 12px",fontFamily:"inherit"}}>Not yet</button>
    </div>}
    {/* Action buttons */}
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      <button onClick={()=>setAiApply(true)} style={{background:G,border:"none",color:"#0a0608",cursor:"pointer",borderRadius:7,padding:mobile?"8px 12px":"7px 14px",fontSize:10,fontWeight:800,fontFamily:"'Cinzel',serif",letterSpacing:.5,display:"inline-flex",alignItems:"center",gap:5,flex:mobile?"1":"none",justifyContent:mobile?"center":"flex-start"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 4px 16px rgba(201,168,76,.35)";}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}><I.Sparkle s={12} c="#0a0608"/>AI Apply</button>
      <button onClick={onApply} style={{background:"rgba(201,168,76,.2)",border:"1px solid rgba(201,168,76,.35)",color:"#f0d080",cursor:"pointer",borderRadius:7,padding:mobile?"8px 12px":"7px 14px",fontSize:10,fontWeight:700,fontFamily:"'Cinzel',serif",display:"inline-flex",alignItems:"center",gap:5,flex:mobile?"1":"none",justifyContent:mobile?"center":"flex-start"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.transform="";}}><I.Arrow s={11} c="#f0d080"/>Careers</button>
      <button onClick={()=>setAiEmail(true)} style={{background:"rgba(232,97,58,.1)",border:"1px solid rgba(232,97,58,.3)",color:"#e8a070",cursor:"pointer",borderRadius:7,padding:mobile?"8px 12px":"7px 14px",fontSize:10,fontWeight:600,fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:5,flex:mobile?"1":"none",justifyContent:mobile?"center":"flex-start"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.transform="";}}><I.Send s={11} c="#e8a070"/>Email</button>
    </div>
    {aiApply&&<AIApplyModal job={job} user={user} onClose={()=>setAiApply(false)} onApplied={(id)=>{onApplied(id);setAiApply(false);}}/>}
    {aiEmail&&<AIEmailModal job={job} user={user} onClose={()=>setAiEmail(false)} onApplied={onApplied}/>}
  </div>;
}


// ── FILTER + SORT HELPERS ─────────────────────────────────────────────────────
function CheckGroup({opts,sel,onChange}) {
  const toggle=v=>onChange(sel.includes(v)?sel.filter(x=>x!==v):[...sel,v]);
  return <div style={{display:"flex",flexDirection:"column",gap:3,maxHeight:180,overflowY:"auto"}}>{opts.map(o=><label key={o} onClick={()=>toggle(o)} style={{display:"flex",alignItems:"center",gap:7,padding:"4px 5px",borderRadius:6,cursor:"pointer",userSelect:"none"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(201,168,76,.06)"} onMouseLeave={e=>e.currentTarget.style.background=""}>
    <div style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${sel.includes(o)?"#c9a84c":"rgba(201,168,76,.25)"}`,background:sel.includes(o)?"#c9a84c":"rgba(201,168,76,.04)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>{sel.includes(o)&&<I.Check s={9} c="#0a0608"/>}</div>
    <span style={{fontSize:12,color:"rgba(244,237,216,.65)"}}>{o}</span>
  </label>)}</div>;
}

function FSection({title,count,children}) {
  const [open,setOpen]=useState(true);
  return <div style={{border:"1px solid rgba(201,168,76,.1)",borderRadius:10,overflow:"hidden",marginBottom:4}}>
    <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",background:"rgba(201,168,76,.05)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,padding:"9px 12px",fontFamily:"'Cinzel',serif",color:"rgba(244,237,216,.6)",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:.8,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(201,168,76,.09)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(201,168,76,.05)"}>
      <span style={{flex:1,textAlign:"left"}}>{title}</span>
      {count>0&&<span style={{background:"#c9a84c",color:"#0a0608",borderRadius:20,fontSize:9,padding:"1px 7px",fontWeight:800}}>{count}</span>}
      <span style={{fontSize:9,color:"rgba(244,237,216,.4)"}}>{open?"▲":"▼"}</span>
    </button>
    {open&&<div style={{padding:"8px 10px 10px"}}>{children}</div>}
  </div>;
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const mobile = useIsMobile();
  const [user,setUser]=useState(null);
  const [tab,setTab]=useState("jobs");
  const [expanded,setExpanded]=useState({});
  const [lastRefresh,setLastRefresh]=useState(new Date());
  const [showAcct,setShowAcct]=useState(false);
  const [jobSort,setJobSort]=useState("default");
  const [liveJobs,setLiveJobs]=useState({});
  const [liveStatus,setLiveStatus]=useState("idle");
  const abortRef=useRef(null);

  const fetchLiveJobs=async()=>{
    if(abortRef.current)abortRef.current.abort();
    abortRef.current=new AbortController();
    const {signal}=abortRef.current;
    setLiveStatus("fetching"); setLiveJobs({});
    const entries=Object.entries(GREENHOUSE_TOKENS);
    const BATCH=5;
    for(let i=0;i<entries.length;i+=BATCH){
      if(signal.aborted)break;
      const batch=entries.slice(i,i+BATCH);
      await Promise.all(batch.map(async([companyName,token])=>{
        let company=null,stateKey="";
        for(const[,states] of Object.entries(COMPANIES_DATA)){
          for(const[state,companies] of Object.entries(states)){
            const found=companies.find(c=>c.name===companyName);
            if(found){company=found;stateKey=state;break;}
          }
          if(company)break;
        }
        if(!company)return;
        try{
          const res=await fetch(`/api/jobs/greenhouse?token=${token}`,{signal});
          if(!res.ok)return;
          const data=await res.json();
          const jobs=(data.jobs||[]).map(j=>normalizeGreenhouseJob(j,company,stateKey));
          if(!signal.aborted)setLiveJobs(prev=>({...prev,[companyName]:jobs.length>0?jobs:null}));
        }catch{}
      }));
      if(!signal.aborted)await new Promise(r=>setTimeout(r,200));
    }
    if(!signal.aborted)setLiveStatus("done");
  };

  useEffect(()=>{ const t=setTimeout(fetchLiveJobs,2000); return()=>{clearTimeout(t);abortRef.current?.abort();}; },[]);

  const getDisplayJobs=(name,gen)=>{ const live=liveJobs[name]; if(live===undefined||live===null||live.length===0)return gen; return live; };
  const [appliedSort,setAppliedSort]=useState("date-desc");
  const [filters,setFilters]=useState({countries:[],states:[],titles:[],experience:[],remote:[],types:[],search:"",newOnly:false,dateFrom:""});
  const [filterOpen,setFilterOpen]=useState(false);
  const refreshTimer=useRef(null);

  useEffect(()=>{refreshTimer.current=setInterval(()=>setLastRefresh(new Date()),300000);return()=>clearInterval(refreshTimer.current);},[]);

  const login=u=>setUser(u);
  const logout = async () => { await supabase.auth.signOut(); setUser(null); setShowAcct(false); };
  const updateUser=u=>setUser(u);

  const markApplied = async (jobId) => {
    setUser(prev => ({ ...prev, applied: { ...prev.applied, [jobId]: { date: new Date().toISOString() } } }));
    const job = Object.values(ALL_JOBS_DATA).flatMap(s => Object.values(s).flatMap(c => Object.values(c).flatMap(co => co.jobs))).find(j => j.id === jobId);
    if (!user?.id || !job) return;
    await supabase.from("applications").upsert({ user_id: user.id, job_id: jobId, job_title: job.title, company: job.company, job_url: job.url, salary: job.salary, applied_at: new Date().toISOString() }, { onConflict: "user_id,job_id" });
  };
  const removeApplied = async (jobId) => {
    setUser(prev => { const na = { ...prev.applied }; delete na[jobId]; return { ...prev, applied: na }; });
    if (!user?.id) return;
    await supabase.from("applications").delete().eq("user_id", user.id).eq("job_id", jobId);
  };

  const toggle=k=>setExpanded(e=>({...e,[k]:!e[k]}));

  const matches=job=>{
    const f=filters;
    if(f.titles.length>0&&!f.titles.includes(job.title))return false;
    if(f.experience?.length>0&&!f.experience.includes(job.experience))return false;
    if(f.remote.includes("Remote OK")&&!job.isRemote)return false;
    if(f.remote.includes("On-site Only")&&job.isRemote)return false;
    if(f.types.length>0&&!f.types.includes(job.type))return false;
    if(f.dateFrom&&new Date(job.posted)<new Date(f.dateFrom))return false;
    if(f.newOnly&&!job.isNew)return false;
    if(f.search){const q=f.search.toLowerCase();if(!job.title.toLowerCase().includes(q)&&!job.company.toLowerCase().includes(q))return false;}
    return true;
  };

  const sortJobs=jobs=>jobs.slice().sort((a,b)=>{
    if(jobSort==="newest")return new Date(b.posted)-new Date(a.posted);
    if(jobSort==="oldest")return new Date(a.posted)-new Date(b.posted);
    if(jobSort==="title")return a.title.localeCompare(b.title);
    return 0;
  });

  const allCountries=Object.keys(ALL_JOBS_DATA);
  const allStates=[...new Set(Object.values(ALL_JOBS_DATA).flatMap(s=>Object.keys(s)))].sort();
  const allTitles=JOB_CATS.slice().sort();
  const hasAnyFilter=filters.titles.length>0||(filters.experience?.length||0)>0||filters.remote.length>0||filters.types.length>0||filters.dateFrom||filters.newOnly||!!filters.search;
  const activeCount=filters.countries.length+filters.states.length+filters.titles.length+(filters.experience?.length||0)+filters.remote.length+filters.types.length+(filters.dateFrom?1:0)+(filters.newOnly?1:0);
  const CLEAR={countries:[],states:[],titles:[],experience:[],remote:[],types:[],search:"",newOnly:false,dateFrom:""};

  // All jobs flat list for stats
  const allJobs=Object.values(ALL_JOBS_DATA).flatMap(s=>Object.values(s).flatMap(c=>Object.values(c).flatMap(co=>co.jobs)));
  const totalJobs=allJobs.filter(matches).length;
  const newJobs=allJobs.filter(j=>j.isNew&&matches(j)).length;
  const totalCos=Object.values(ALL_JOBS_DATA).flatMap(s=>Object.values(s).flatMap(c=>Object.keys(c))).length;
  const appliedJobs=allJobs.filter(j=>user?.applied?.[j.id]);

  if(!user)return <Auth onLogin={login}/>;

  const G="linear-gradient(135deg,#c9a84c,#e8613a)";
  const gBg="linear-gradient(135deg,rgba(201,168,76,.2),rgba(232,97,58,.15))";
  const sortChip=(val,lbl)=><button onClick={()=>setJobSort(val)} style={{background:jobSort===val?"rgba(201,168,76,.15)":"rgba(201,168,76,.05)",border:`1px solid ${jobSort===val?"rgba(201,168,76,.4)":"rgba(201,168,76,.12)"}`,color:jobSort===val?"#f0d080":"rgba(244,237,216,.45)",cursor:"pointer",borderRadius:20,fontSize:10,padding:"3px 12px",fontFamily:"'Cinzel',serif",letterSpacing:.3,transition:"all .15s"}}>{lbl}</button>;

  return <>
    <Head>
      <title>Main Quest — Game Industry Job Board</title>
      <meta name="description" content="Find your next game industry job. 300+ studios, AI-powered applications."/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Cinzel:wght@400;700;900&family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet"/>
    </Head>
    <div style={{minHeight:"100vh",background:"#080608",color:"#f4edd8",fontFamily:"'Space Grotesk',sans-serif",position:"relative",overflowX:"hidden"}}>
    {/* Styles */}
    <style>{`*{box-sizing:border-box;margin:0;padding:0;}body{background:#080608!important;-webkit-text-size-adjust:100%;}@keyframes ob1{0%,100%{transform:translate(0,0)}50%{transform:translate(50px,-30px)}}@keyframes ob2{0%,100%{transform:translate(0,0)}50%{transform:translate(-60px,30px)}}@keyframes ob3{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-50px)}}@keyframes pnew{0%,100%{box-shadow:0 0 0 0 rgba(192,50,26,.5)}50%{box-shadow:0 0 0 5px rgba(192,50,26,0)}}input,select,textarea{font-size:16px!important;}input:focus,select:focus,textarea:focus{outline:none;border-color:#c9a84c!important;box-shadow:0 0 0 2px rgba(201,168,76,.15);}::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(201,168,76,.2);border-radius:3px;}button{-webkit-tap-highlight-color:transparent;}@media(max-width:640px){.hide-mobile{display:none!important;}}`}</style>
    {/* BG orbs */}
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
      <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",filter:"blur(120px)",opacity:.16,background:"radial-gradient(circle,#c9a84c,transparent)",top:-200,left:-100,animation:"ob1 20s ease-in-out infinite"}}/>
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",filter:"blur(120px)",opacity:.13,background:"radial-gradient(circle,#8b2020,transparent)",bottom:-180,right:-100,animation:"ob2 25s ease-in-out infinite"}}/>
      <div style={{position:"absolute",width:450,height:450,borderRadius:"50%",filter:"blur(100px)",opacity:.1,background:"radial-gradient(circle,#4a2d6e,transparent)",top:"35%",left:"45%",animation:"ob3 17s ease-in-out infinite"}}/>
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(201,168,76,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.025) 1px,transparent 1px)",backgroundSize:"56px 56px"}}/>
    </div>
    {/* Header */}
    <header style={{position:"sticky",top:0,zIndex:100,background:"rgba(8,6,8,.88)",backdropFilter:"blur(30px)",borderBottom:"1px solid rgba(201,168,76,.14)",display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"space-between",padding:mobile?"8px 14px":"0 24px",height:mobile?"auto":66,gap:10,flexWrap:mobile?"wrap":"nowrap"}}>
      {/* LEFT: Logo + nav tabs */}
      <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:20,filter:"drop-shadow(0 0 8px rgba(201,168,76,.5))"}}>⚔️</span>
          <div><div style={{fontFamily:"'Cinzel',serif",fontSize:7,color:"rgba(201,168,76,.5)",letterSpacing:4,lineHeight:1}}>YOUR CAREER</div><div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:mobile?13:16,fontWeight:700,background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.1}}>Main Quest</div></div>
        </div>
        <nav style={{display:"flex",gap:3,background:"rgba(201,168,76,.05)",border:"1px solid rgba(201,168,76,.12)",borderRadius:10,padding:3}}>
          {[["jobs",<><I.Map s={12} c="currentColor"/><span style={{whiteSpace:"nowrap"}}>{mobile?"Jobs":"Job Board"}</span>{newJobs>0&&<span style={{background:"#c9a84c",color:"#0a0608",borderRadius:20,fontSize:9,padding:"1px 5px",fontWeight:800}}>{newJobs}</span>}</>],["applied",<><I.Scroll s={12} c="currentColor"/><span style={{whiteSpace:"nowrap"}}>{mobile?"Applied":"Job Applications"}</span>{appliedJobs.length>0&&<span style={{background:"#7ecfb3",color:"#080608",borderRadius:20,fontSize:9,padding:"1px 5px",fontWeight:800}}>{appliedJobs.length}</span>}</>]].map(([id,cnt])=>
            <button key={id} onClick={()=>setTab(id)} style={{background:tab===id?gBg:"none",border:tab===id?"1px solid rgba(201,168,76,.25)":"1px solid transparent",cursor:"pointer",color:tab===id?"#f0d080":"rgba(244,237,216,.45)",fontSize:11,fontWeight:600,padding:mobile?"7px 8px":"6px 14px",borderRadius:8,display:"flex",alignItems:"center",gap:5,fontFamily:"'Cinzel',serif",letterSpacing:.3,transition:"all .2s"}}>{cnt}</button>)}
        </nav>
        {!mobile&&<><span style={{fontSize:10,color:"rgba(244,237,216,.3)",fontFamily:"'Cinzel',serif"}}>Synced {lastRefresh.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
        <button onClick={()=>{setLastRefresh(new Date());fetchLiveJobs();}} title="Refresh" style={{background:"none",border:"none",cursor:"pointer",color:"#c9a84c",padding:2,transition:"transform .4s"}} onMouseEnter={e=>e.currentTarget.style.transform="rotate(180deg)"} onMouseLeave={e=>e.currentTarget.style.transform=""}><I.Refresh s={13} c="currentColor"/></button>
        {liveStatus==="fetching"&&<span style={{fontSize:9,color:"rgba(126,207,179,.6)",fontFamily:"'Cinzel',serif"}}>fetching…</span>}
        {liveStatus==="done"&&<span style={{fontSize:9,color:"rgba(126,207,179,.6)",fontFamily:"'Cinzel',serif"}}>● {Object.values(liveJobs).filter(v=>Array.isArray(v)&&v.length>0).length} live</span>}</>
        }
      </div>
      {/* RIGHT: Profile avatar */}
      <button onClick={()=>setShowAcct(true)} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.18)",cursor:"pointer",borderRadius:22,padding:"4px 12px 4px 4px",flexShrink:0}} onMouseEnter={e=>e.currentTarget.style.background="rgba(201,168,76,.1)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(201,168,76,.06)"}>
        <div style={{width:28,height:28,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#0a0608",fontFamily:"'Cinzel',serif"}}>{user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"?"}</div>
        {!mobile&&<span style={{fontSize:12,color:"rgba(244,237,216,.6)",fontWeight:500}}>{user.name}</span>}
      </button>
    </header>
    {showAcct&&<AccountPanel user={user} onClose={()=>setShowAcct(false)} onUpdate={updateUser} onLogout={logout}/>}

    <main style={{position:"relative",zIndex:1,maxWidth:1100,margin:"0 auto",padding:mobile?"14px 12px":"24px 18px"}}>
      {tab==="jobs"&&<>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(4,1fr)",gap:8,marginBottom:16}}>
          {[[totalJobs,"Open Positions",false],[newJobs,"New (48h)",true],[totalCos,"Companies",false],[allCountries.length,"Countries",false]].map(([n,lbl,hi])=>
            <div key={lbl} style={{background:hi?"rgba(232,97,58,.07)":"rgba(201,168,76,.05)",border:`1px solid ${hi?"rgba(232,97,58,.3)":"rgba(201,168,76,.15)"}`,borderRadius:10,padding:mobile?"8px 10px":"10px 18px",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:mobile?18:20,fontWeight:700,background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{n}</span>
              <span style={{fontSize:mobile?8:9,color:"rgba(244,237,216,.4)",textTransform:"uppercase",letterSpacing:.8,fontFamily:"'Cinzel',serif",textAlign:"center"}}>{lbl}</span>
            </div>)}
        </div>
        {/* Filter bar */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <button onClick={()=>setFilterOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:7,background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.2)",color:"#f4edd8",cursor:"pointer",fontSize:11,padding:"8px 14px",borderRadius:10,fontFamily:"'Cinzel',serif",fontWeight:600,letterSpacing:.5,flexShrink:0}}>
              <I.Cog s={13} c="currentColor"/>Filters{activeCount>0&&<span style={{background:"#c9a84c",color:"#0a0608",borderRadius:20,fontSize:9,padding:"1px 7px",fontWeight:800}}>{activeCount}</span>}{filterOpen?"▲":"▼"}
            </button>
            <div style={{flex:1,minWidth:180,position:"relative"}}>
              <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:12,opacity:.4,pointerEvents:"none"}}><I.Compass s={12} c="currentColor"/></span>
              <input value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value}))} placeholder="Search company or title…" style={{width:"100%",background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.18)",color:"#f4edd8",borderRadius:8,padding:"8px 12px 8px 32px",fontSize:12,fontFamily:"inherit"}}/>
            </div>
            {activeCount>0&&<button onClick={()=>setFilters(CLEAR)} style={{background:"rgba(232,97,58,.1)",border:"1px solid rgba(232,97,58,.3)",color:"#e8a070",cursor:"pointer",fontSize:11,padding:"7px 12px",borderRadius:8,fontFamily:"inherit",flexShrink:0}}>✕ Clear</button>}
          </div>
          {filterOpen&&<div style={{background:"rgba(16,10,22,.7)",backdropFilter:"blur(20px)",border:"1px solid rgba(201,168,76,.18)",borderRadius:14,padding:mobile?12:16,marginTop:8,display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(190px,1fr))",gap:4}}>
            <FSection title="Country" count={filters.countries.length}><CheckGroup opts={allCountries} sel={filters.countries} onChange={v=>setFilters(f=>({...f,countries:v}))}/></FSection>
            <FSection title="State / Province" count={filters.states.length}><CheckGroup opts={filters.countries.length>0?allStates.filter(s=>filters.countries.some(c=>Object.keys(ALL_JOBS_DATA[c]||{}).includes(s))):allStates} sel={filters.states} onChange={v=>setFilters(f=>({...f,states:v}))}/></FSection>
            <FSection title="Position Title" count={filters.titles.length}><CheckGroup opts={allTitles} sel={filters.titles} onChange={v=>setFilters(f=>({...f,titles:v}))}/></FSection>
            <FSection title="Experience Level" count={filters.experience?.length||0}><CheckGroup opts={["Entry Level","Mid Level","Senior","Lead","Principal","Director"]} sel={filters.experience||[]} onChange={v=>setFilters(f=>({...f,experience:v}))}/></FSection>
            <FSection title="Work Type" count={filters.types.length+filters.remote.length}>
              <div style={{fontSize:9,color:"rgba(201,168,76,.6)",textTransform:"uppercase",letterSpacing:.8,fontFamily:"'Cinzel',serif",marginBottom:5}}>Job Type</div>
              <CheckGroup opts={["Full-time","Contract","Volunteer"]} sel={filters.types} onChange={v=>setFilters(f=>({...f,types:v}))}/>
              <div style={{fontSize:9,color:"rgba(201,168,76,.6)",textTransform:"uppercase",letterSpacing:.8,fontFamily:"'Cinzel',serif",marginBottom:5,marginTop:8}}>Location</div>
              <CheckGroup opts={["Remote OK","On-site Only"]} sel={filters.remote} onChange={v=>setFilters(f=>({...f,remote:v}))}/>
            </FSection>
            <FSection title="Date & Other" count={(filters.dateFrom?1:0)+(filters.newOnly?1:0)}>
              <div style={{fontSize:9,color:"rgba(201,168,76,.6)",textTransform:"uppercase",letterSpacing:.8,fontFamily:"'Cinzel',serif",marginBottom:4}}>Posted After</div>
              <input type="date" value={filters.dateFrom} onChange={e=>setFilters(f=>({...f,dateFrom:e.target.value}))} style={{width:"100%",background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.18)",color:"#f4edd8",borderRadius:8,padding:"7px 10px",fontSize:11,fontFamily:"inherit",marginBottom:10}}/>
              <label onClick={()=>setFilters(f=>({...f,newOnly:!f.newOnly}))} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",userSelect:"none"}}>
                <div style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${filters.newOnly?"#c9a84c":"rgba(201,168,76,.25)"}`,background:filters.newOnly?"#c9a84c":"rgba(201,168,76,.04)",display:"flex",alignItems:"center",justifyContent:"center"}}>{filters.newOnly&&<I.Check s={9} c="#0a0608"/>}</div>
                <span style={{fontSize:11,color:"rgba(244,237,216,.65)"}}>New Postings Only (≤48h)</span>
              </label>
            </FSection>
          </div>}
        </div>
        {/* Sort bar */}
        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",padding:mobile?"7px 10px":"8px 12px",background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.08)",borderRadius:10,marginBottom:12}}>
          <span style={{fontSize:9,color:"rgba(201,168,76,.6)",fontFamily:"'Cinzel',serif",textTransform:"uppercase",letterSpacing:.8,marginRight:2}}>Sort:</span>
          {sortChip("default","Default")}{sortChip("newest","Newest")}{sortChip("oldest","Oldest")}{!mobile&&sortChip("title","Title A–Z")}
        </div>
        {/* Job tree */}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {Object.entries(ALL_JOBS_DATA)
            .filter(([country])=>filters.countries.length===0||filters.countries.includes(country))
            .map(([country,states])=>{
              const cKey=`c-${country}`;
              const cNewJobs=Object.values(states).flatMap(cos=>Object.values(cos).flatMap(co=>co.jobs)).some(j=>j.isNew&&matches(j));
              const cTotal=Object.values(states).flatMap(cos=>Object.values(cos).flatMap(co=>co.jobs)).filter(matches).length;
              return <div key={country} style={{background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.14)",borderRadius:14,overflow:"hidden"}}>
                <button onClick={()=>toggle(cKey)} style={{width:"100%",textAlign:"left",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:10,padding:mobile?"11px 12px":"14px 16px",fontFamily:"'Cinzel',serif",fontSize:mobile?12:13,fontWeight:700,color:"#f4edd8",letterSpacing:.5,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(201,168,76,.04)"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                  <span style={{fontSize:9,color:"rgba(201,168,76,.45)"}}>{expanded[cKey]?"▼":"▶"}</span>
                  <span style={{fontSize:16}}>{country==="United States"?"🇺🇸":"🇨🇦"}</span>
                  <span style={{flex:1}}>{country}</span>
                  {cNewJobs&&<span style={{width:16,height:16,borderRadius:"50%",background:"#c0321a",display:"flex",alignItems:"center",justifyContent:"center",animation:"pnew 1.5s ease-in-out infinite"}}><I.Alert s={14}/></span>}
                  <span style={{fontSize:9,color:"rgba(244,237,216,.4)",background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.12)",padding:"2px 8px",borderRadius:20,fontFamily:"'Cinzel',serif"}}>{cTotal} jobs</span>
                </button>
                {expanded[cKey]&&<div style={{padding:"4px 10px 10px",display:"flex",flexDirection:"column",gap:5}}>
                  {Object.entries(states)
                    .filter(([state])=>filters.states.length===0||filters.states.includes(state))
                    .map(([state,companies])=>{
                      const sKey=`s-${country}-${state}`;
                      const sTotal=Object.values(companies).flatMap(co=>co.jobs).filter(matches).length;
                      const sNewJobs=Object.values(companies).flatMap(co=>co.jobs).some(j=>j.isNew&&matches(j));
                      // Show state unless search active and nothing matches
                      if(filters.search){const q=filters.search.toLowerCase();const anyName=Object.keys(companies).some(n=>n.toLowerCase().includes(q));const anyJob=sTotal>0;if(!anyName&&!anyJob)return null;}
                      return <div key={state} style={{background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.08)",borderRadius:10,overflow:"hidden"}}>
                        <button onClick={()=>toggle(sKey)} style={{width:"100%",textAlign:"left",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,padding:mobile?"8px 10px":"10px 12px",fontFamily:"'Cinzel',serif",fontSize:mobile?10:11,fontWeight:600,color:"#c9a84c",letterSpacing:.3,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(201,168,76,.06)"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                          <span style={{fontSize:8,color:"rgba(201,168,76,.4)"}}>{expanded[sKey]?"▼":"▶"}</span>
                          <span style={{flex:1}}>{state}</span>
                          {sNewJobs&&<span style={{width:14,height:14,borderRadius:"50%",background:"#c0321a",display:"flex",alignItems:"center",justifyContent:"center",animation:"pnew 1.5s ease-in-out infinite"}}><I.Alert s={12}/></span>}
                          <span style={{fontSize:9,color:"rgba(244,237,216,.35)",background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.1)",padding:"1px 7px",borderRadius:20}}>{sTotal} jobs · {Object.keys(companies).length} co.</span>
                        </button>
                        {expanded[sKey]&&<div style={{padding:"4px 8px 8px",display:"flex",flexDirection:"column",gap:4}}>
                          {Object.entries(companies)
                            .filter(([name,company])=>{
                              if(!hasAnyFilter)return true;
                              const displayJobs=getDisplayJobs(name,company.jobs);
                              if(filters.search){const q=filters.search.toLowerCase();if(name.toLowerCase().includes(q))return true;}
                              return displayJobs.some(j=>matches(j));
                            })
                            .map(([name,company])=>{
                              const coKey=`co-${country}-${state}-${name}`;
                              const displayJobs=getDisplayJobs(name,company.jobs);
                              const isLive=Array.isArray(liveJobs[name])&&liveJobs[name].length>0;
                              const fJobs=sortJobs(displayJobs.filter(matches));
                              const hasNew=fJobs.some(j=>j.isNew);
                              const noJobs=fJobs.length===0;
                              return <div key={name} style={{background:"rgba(201,168,76,.02)",border:"1px solid rgba(201,168,76,.06)",borderRadius:8,overflow:"hidden",opacity:noJobs?.7:1,transition:"opacity .2s"}} onMouseEnter={e=>{if(noJobs)e.currentTarget.style.opacity="1";}} onMouseLeave={e=>{if(noJobs)e.currentTarget.style.opacity=".7";}}>
                                <button onClick={()=>toggle(coKey)} style={{width:"100%",textAlign:"left",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,padding:mobile?"8px 10px":"9px 11px",fontSize:mobile?11:12,color:"#f4edd8",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(201,168,76,.04)"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                                  <span style={{fontSize:8,color:"rgba(201,168,76,.35)"}}>{expanded[coKey]?"▼":"▶"}</span>
                                  <span style={{width:6,height:6,borderRadius:"50%",background:noJobs?"rgba(244,237,216,.2)":"#c9a84c",flexShrink:0}}/>
                                  <span style={{flex:1,fontWeight:500}}>{name}</span>
                                  {hasNew&&<span style={{width:14,height:14,borderRadius:"50%",background:"#c0321a",display:"flex",alignItems:"center",justifyContent:"center",animation:"pnew 1.5s ease-in-out infinite"}}><I.Alert s={12}/></span>}
                                  {isLive&&<span style={{background:"rgba(126,207,179,.12)",border:"1px solid rgba(126,207,179,.3)",color:"#7ecfb3",borderRadius:20,fontSize:8,padding:"1px 6px",fontWeight:700,marginRight:3}}>● Live</span>}<span style={{fontSize:9,color:"rgba(244,237,216,.35)",background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.1)",padding:"1px 7px",borderRadius:20,fontStyle:noJobs?"italic":"normal"}}>{noJobs?"No openings":`${fJobs.length} opening${fJobs.length!==1?"s":""}`}</span>
                                </button>
                                {expanded[coKey]&&<div style={{padding:"6px 8px 8px",display:"flex",flexDirection:"column",gap:5}}>
                                  {noJobs
                                    ?<NoOpenCard company={company} companyName={name} user={user} onApplied={markApplied}/>
                                    :fJobs.map(j=><JobCard key={j.id} job={j} user={user} onApplied={markApplied}/>)}
                                </div>}
                              </div>;
                            })}
                        </div>}
                      </div>;
                    })}
                </div>}
              </div>;
            })}
        </div>
      </>}

      {tab==="applied"&&<div>
        <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:18,flexWrap:"wrap"}}>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:1}}>📜 Job Applications</h2>
          {appliedJobs.length>0&&<div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap",paddingTop:mobile?6:4,width:mobile?"100%":"auto"}}>
            <span style={{fontSize:9,color:"rgba(201,168,76,.6)",fontFamily:"'Cinzel',serif",textTransform:"uppercase",letterSpacing:.8}}>Sort:</span>
            {[["date-desc","Date ↓"],["date-asc","Date ↑"],["company","Company"],["title","Role"]].map(([v,l])=><button key={v} onClick={()=>setAppliedSort(v)} style={{background:appliedSort===v?"rgba(201,168,76,.15)":"rgba(201,168,76,.05)",border:`1px solid ${appliedSort===v?"rgba(201,168,76,.4)":"rgba(201,168,76,.12)"}`,color:appliedSort===v?"#f0d080":"rgba(244,237,216,.45)",cursor:"pointer",borderRadius:20,fontSize:10,padding:"3px 12px",fontFamily:"'Cinzel',serif",letterSpacing:.3}}>{l}</button>)}
          </div>}
        </div>
        {appliedJobs.length===0?<div style={{padding:"48px 0",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <span style={{fontSize:40}}>📋</span><p style={{color:"rgba(244,237,216,.55)",fontSize:14,fontFamily:"'Cinzel',serif"}}>No applications tracked yet.</p><p style={{color:"rgba(244,237,216,.4)",fontSize:12}}>When you apply and confirm, it'll appear here.</p>
        </div>:<div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[...appliedJobs].sort((a,b)=>{
            const ad=user.applied[a.id]?.date?new Date(user.applied[a.id].date):new Date(0);
            const bd=user.applied[b.id]?.date?new Date(user.applied[b.id].date):new Date(0);
            if(appliedSort==="date-desc")return bd-ad;
            if(appliedSort==="date-asc")return ad-bd;
            if(appliedSort==="company")return a.company.localeCompare(b.company);
            if(appliedSort==="title")return a.title.localeCompare(b.title);
            return 0;
          }).map(job=>{
            const entry=user.applied[job.id];
            const appliedDate=entry?.date?new Date(entry.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Unknown";
            return <div key={job.id} style={{background:"rgba(16,10,22,.6)",border:"1px solid rgba(201,168,76,.14)",borderRadius:12,padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start",flexDirection:mobile?"column":"row"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6}}>
                    <span style={{background:"rgba(126,207,179,.12)",border:"1px solid rgba(126,207,179,.3)",color:"#7ecfb3",borderRadius:20,fontSize:10,padding:"2px 9px",fontWeight:600}}><I.Check s={10} c="#7ecfb3"/> Applied</span>
                    <span style={{fontSize:12,fontWeight:600,color:"rgba(244,237,216,.6)",fontFamily:"'Cinzel',serif"}}>{job.company}</span>
                    <span style={{fontSize:10,color:"rgba(244,237,216,.4)",background:"rgba(201,168,76,.06)",padding:"2px 9px",borderRadius:20}}>{job.state}</span>
                  </div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:700,color:"#f4edd8",marginBottom:6,letterSpacing:.5}}>{job.title}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {[job.type,job.isRemote&&"Remote OK",job.salary&&job.salary,`Posted ${job.postedStr}`].filter(Boolean).map((c,i)=><span key={i} style={{background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.15)",borderRadius:20,fontSize:10,padding:"2px 9px",color:"rgba(244,237,216,.6)"}}>{c}</span>)}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:mobile?"row":"column",alignItems:mobile?"center":"flex-end",gap:8,justifyContent:mobile?"space-between":"flex-start"}}>
                  <div style={{background:"rgba(126,207,179,.07)",border:"1px solid rgba(126,207,179,.2)",borderRadius:10,padding:"7px 12px",textAlign:"center"}}>
                    <div style={{fontSize:9,color:"#7ecfb3",textTransform:"uppercase",letterSpacing:.8,fontFamily:"'Cinzel',serif",marginBottom:2}}>Applied</div>
                    <div style={{fontSize:11,color:"#f4edd8",fontWeight:600,whiteSpace:"nowrap"}}>{appliedDate}</div>
                  </div>
                  <button onClick={()=>removeApplied(job.id)} title="Remove" style={{background:"rgba(192,50,26,.08)",border:"1px solid rgba(192,50,26,.2)",color:"rgba(232,120,90,.7)",cursor:"pointer",width:26,height:26,borderRadius:8,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(192,50,26,.2)";e.currentTarget.style.color="#e87060";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(192,50,26,.08)";e.currentTarget.style.color="rgba(232,120,90,.7)";}}><I.X s={11} c="currentColor"/></button>
                </div>
              </div>
              <a href={job.applyUrl||job.url} target="_blank" rel="noreferrer" style={{textDecoration:"none",display:"inline-flex",alignItems:"center",gap:5,background:"rgba(201,168,76,.12)",border:"1px solid rgba(201,168,76,.25)",color:"#f0d080",borderRadius:8,padding:"6px 14px",fontSize:11,fontFamily:"'Cinzel',serif",fontWeight:700,letterSpacing:.3}}>View Posting <I.Arrow s={11} c="#f0d080"/></a>
            </div>;
          })}
        </div>}
      </div>}
    </main>
  </div>
  </>;
}