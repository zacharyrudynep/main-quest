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
      { name: "Design Works Gaming", url: "https://recruiting.paylocity.com/Recruiting/Jobs/All/6aea33a3-f72a-4f46-a5be-d306bc3a68d8/Design-Works-Gaming", email: null, contact: null },
      { name: "E-Line Media", url: "https://www.elinemedia.com/careers", email: "contactus@elinemedia.com", contact: null },
      { name: "Rainbow Studios", url: "https://www.rainbowstudios.com/careers/", email: null, contact: "https://www.rainbowstudios.com/contact-us/" },
      { name: "Razor Edge Games", url: "https://razoredgegames.com/job/", email: null, contact: "https://razoredgegames.com/contact-us/" },
      { name: "Wolfpack Game Design", url: "https://www.wolfpackgamedesign.com/join-us", email: "community@wolfpackgamedesign.com", contact: null },
    ],
    "Arkansas": [
      { name: "Causeway Studios", url: "https://www.causewaystudios.com/", email: "hello@causewaystudios.com", contact: null },
    ],
    "California": [
      { name: "2k Games", url: "https://2k.com/", email: null, contact: null },
      { name: "31st Union", url: "https://thirtyfirstunion.com/careers/", email: null, contact: null },
      { name: "505 Games", url: "https://careersat505games.com/", email: null, contact: null },
      { name: "Absurd Ventures", url: "https://www.absurdventures.com/careers", email: null, contact: null },
      { name: "Activision", url: "https://careers.activision.com/", email: null, contact: null },
      { name: "AdHoc Studio", url: "https://careers.adhocla.com/", email: null, contact: null },
      { name: "AGBO", url: "https://agbo.com/careers/", email: null, contact: null },
      { name: "Airstrafe Interactive", url: "https://airstrafeinteractive.com/sections/careers/gameplay-designer", email: null, contact: null },
      { name: "Akili Interactive", url: "https://www.akiliinteractive.com/careers", email: null, contact: null },
      { name: "Alta Reality", url: "https://www.altavr.io/", email: null, contact: null },
      { name: "Amazing Seasun Games", url: "https://job.seasungames.com/#/", email: null, contact: null },
      { name: "Amazon Game Studio", url: "https://www.amazongamestudios.com/en-us/careers", email: null, contact: null },
      { name: "Amber", url: "https://jobs.jobvite.com/amberstudiocareers/", email: null, contact: null },
      { name: "ANIMAL", url: "https://animalmade.com/careers", email: null, contact: null },
      { name: "Animal Repair Shop", url: "https://www.animalrepairshop.com/careers/", email: null, contact: null },
      { name: "Annapurna Interactive", url: "https://www.annapurna.com/jobs", email: null, contact: null },
      { name: "App Lovin", url: "https://applovin.com/en/careers", email: null, contact: null },
      { name: "Arc Games", url: "https://www.arcgames.com/careers", email: null, contact: null },
      { name: "Ares Interactive", url: "https://aresinteractive.com/careers/", email: null, contact: null },
      { name: "Atlas V", url: "https://atlasv.io/career/", email: null, contact: null },
      { name: "Atlus", url: "https://atlus.com/", email: null, contact: null },
      { name: "Azra Games", url: "https://azragames.com/careers/", email: null, contact: null },
      { name: "Bad Robot Games", url: "https://www.badrobotgames.com/careers", email: null, contact: null },
      { name: "Bandai Namco", url: "https://www.bandainamcoent.com/careers#join", email: null, contact: null },
      { name: "Baobab Studios", url: "https://www.baobabstudios.com/about#careers", email: null, contact: null },
      { name: "Believer Entertainment", url: "https://believer.gg/jobs/", email: null, contact: null },
      { name: "Big Run Studios", url: "https://bigrunstudios.com/careers/", email: null, contact: null },
      { name: "Bigpoint", url: "https://www.bigpoint.net/careers/", email: null, contact: null },
      { name: "BKOM Studios", url: "https://jobs.bkom.com/jobs/Careers", email: null, contact: null },
      { name: "Bladework Games", url: "https://bladeworkgames.com/#careers", email: null, contact: null },
      { name: "Blind Squirrel Entertainment", url: "https://blindsquirrelentertainment.com/careers", email: null, contact: null },
      { name: "Blizzard Entertainment", url: "https://careers.blizzard.com/global/en", email: null, contact: null },
      { name: "Bluembo", url: "https://www.bluembo.com/careers/", email: null, contact: null },
      { name: "Bonfire Studios", url: "https://www.bonfirestudios.com/work-with-us/", email: null, contact: null },
      { name: "Bullet Farm", url: "https://bulletfarm.com/careers/", email: null, contact: null },
      { name: "Candescent Games", url: "https://www.canplay.com/jobs", email: null, contact: null },
      { name: "Capcom", url: "https://jobs.jobvite.com/capcomusa", email: null, contact: null },
      { name: "Capital Games", url: "https://www.ea.com/ea-studios/capital-games/careers", email: null, contact: null },
      { name: "Carbonated", url: "https://www.carbonated.com/job-listings", email: null, contact: null },
      { name: "CayPlay Studios", url: "https://cayplay.com/careers", email: null, contact: null },
      { name: "CCG Lab", url: "https://ccglab.com/careers/", email: null, contact: null },
      { name: "Clockwork Labs", url: "https://clockworklabs.io/join", email: null, contact: null },
      { name: "Cloud Chamber", url: "https://2k.com/studios/cloud-chamber/", email: null, contact: null },
      { name: "Cold Iron Studios", url: "https://coldironstudios.com/", email: null, contact: null },
      { name: "Com2us", url: "https://com2us-usa.breezy.hr/", email: null, contact: null },
      { name: "Core Loop", url: "https://coreloop.gg/#page-0", email: null, contact: null },
      { name: "Crazy Maple Studio", url: "https://apply.workable.com/crazymaplestudio/", email: null, contact: null },
      { name: "Crystal Dynamics", url: "https://www.crystaldynamics.com/careers/", email: null, contact: null },
      { name: "Daybreak Games", url: "https://www.daybreakgames.com/careers", email: null, contact: null },
      { name: "Deep Silver", url: "https://plaion.com/join-us", email: null, contact: null },
      { name: "Demonware", url: "https://www.demonware.net/careers", email: null, contact: null },
      { name: "Discord", url: "https://discord.com/careers", email: null, contact: null },
      { name: "Double Fine Productions", url: "https://www.doublefine.com/jobs", email: null, contact: null },
      { name: "Dreamhaven", url: "https://www.dreamhaven.com/careers", email: null, contact: null },
      { name: "Dreamlit", url: "https://www.dreamlit.games/career", email: null, contact: null },
      { name: "EA", url: "https://www.ea.com/careers", email: null, contact: null },
      { name: "Echtra Games", url: "https://www.zynga.com/jobs/careers/", email: null, contact: null },
      { name: "Elsewhere", url: "https://app.dover.com/Elsewhere/careers/3e7bba3e-a4a7-4285-9999-58d78d242ffa", email: null, contact: null },
      { name: "Emberlab", url: "https://emberlab.com/careers/", email: null, contact: null },
      { name: "Epic Games", url: "https://www.epicgames.com/site/careers/jobs", email: null, contact: null },
      { name: "Evening Star", url: "https://eveningstar.studio/careers.html", email: null, contact: null },
      { name: "Evil Eye Pictures", url: "https://www.evileyepictures.com/jobs/no-open-positions", email: null, contact: null },
      { name: "Experiment 7", url: "https://www.experiment7.com/careers", email: null, contact: null },
      { name: "Exploding Kittens", url: "https://www.explodingkittens.com/pages/careers-our-story", email: null, contact: null },
      { name: "Floor 84 Studio", url: "https://floor84studio.zohorecruit.com/jobs/Careers-at-F84", email: null, contact: null },
      { name: "FarSight Studio", url: "https://farsightstudios.com/", email: null, contact: null },
      { name: "Flatter than Earth", url: "https://www.flatterthanearth.com/join-us", email: null, contact: null },
      { name: "Flying Mollusk", url: "https://www.flyingmollusk.com/careers", email: null, contact: null },
      { name: "Free Range Games", url: "https://www.freerangegames.com/jobs", email: null, contact: null },
      { name: "Frost Giant Studios", url: "https://frostgiant.com/", email: null, contact: null },
      { name: "Funcraft", url: "https://www.funcraft.com/", email: null, contact: null },
      { name: "Funovus", url: "https://www.funovus.com/careers", email: null, contact: null },
      { name: "FunPlus", url: "https://funplus.com/careers/", email: null, contact: null },
      { name: "Fuzzy Bot", url: "https://www.fuzzybot.com/careers", email: null, contact: null },
      { name: "G5 Entertainment", url: "https://jobs.g5.com/", email: null, contact: null },
      { name: "Game Garden", url: "https://www.game-garden.com/#career", email: null, contact: null },
      { name: "Gamebreaking Studios", url: "https://careers.gamebreaking.com/?utm_source=gamebreakingcom&utm_medium=link&utm_content=nav", email: null, contact: null },
      { name: "Gameloft", url: "https://www.gameloft.com/careers", email: null, contact: null },
      { name: "Gardens Interactive", url: "https://gardens.dev/careers", email: null, contact: null },
      { name: "Giant Skull", url: "https://www.giantskull.com/", email: null, contact: null },
      { name: "Giant Sparrow", url: "https://www.giantsparrow.com/jobs/", email: null, contact: null },
      { name: "Giant Squid", url: "https://giantsquidstudios.com/Jobs", email: null, contact: null },
      { name: "GRX IMMERSIVE", url: "https://www.grximmersive.com/join", email: null, contact: null },
      { name: "Gunzilla Ganes", url: "https://www.gunzillagames.com/en/careers/", email: null, contact: null },
      { name: "Gym Class Games", url: "https://www.ycombinator.com/companies/gym-class/jobs", email: null, contact: null },
      { name: "Hangar 13", url: "https://2k.com/studios/hangar-13/careers/", email: null, contact: null },
      { name: "Happy Dance Games", url: "https://www.happydancegames.com/Careers-Internship-premium-game-studio-jobs.html", email: null, contact: null },
      { name: "Heart Machine", url: "https://www.heartmachine.com/careers", email: null, contact: null },
      { name: "Heavy Iron Studios", url: "https://heavyiron.games/careers/", email: null, contact: null },
      { name: "Hidden Variable Studios", url: "https://www.hiddenvariable.com/careers/", email: null, contact: null },
      { name: "HiDef", url: "https://hidef.com/careers/", email: null, contact: null },
      { name: "Hypersonic Laboratories", url: "https://www.hypersoniclaboratories.com/careers", email: null, contact: null },
      { name: "Imagendary Studios", url: "https://imagendary.com/careers/", email: null, contact: null },
      { name: "Impulse Gear", url: "https://www.impulsegear.com/careers", email: null, contact: null },
      { name: "Infinity Ward", url: "https://careers.infinityward.com/", email: null, contact: null },
      { name: "Infold Games", url: "https://www.infoldgames.com/en/home#job", email: null, contact: null },
      { name: "Insomniac Games", url: "https://insomniac.games/careers", email: null, contact: null },
      { name: "InXile Entertainment", url: "https://www.inxile-entertainment.com/careers", email: null, contact: null },
      { name: "Iridium Studios", url: "https://playiridium.com/jobs/", email: null, contact: null },
      { name: "Jam & Tea Studios", url: "https://www.jamandtea.studio/#career", email: null, contact: null },
      { name: "Jam City", url: "https://www.jamcity.com/life-at-jam-city/", email: null, contact: null },
      { name: "Kabam", url: "https://kabam.com/careers/", email: null, contact: null },
      { name: "Kakao Games", url: "https://recruit.kakaogames.com/en/homekr", email: null, contact: null },
      { name: "Kevuru Games", url: "https://kevurugames.com/career/", email: null, contact: null },
      { name: "King", url: "https://careers.king.com/us/en", email: null, contact: null },
      { name: "Konami", url: "https://www.konami.com/games/us/en/jobs/", email: null, contact: null },
      { name: "Lab Zero", url: "https://labzerogames.com/jobs/", email: null, contact: null },
      { name: "Lightbound Studios", url: "http://starchasersgame.com/", email: null, contact: null },
      { name: "Lightspeed", url: "https://lightspeed.la/en/careers", email: null, contact: null },
      { name: "Linden Lab", url: "https://lindenlab.com/careers", email: null, contact: null },
      { name: "Lion Studios", url: "https://www.tripledot.com/careers#js-careers-jobs-block", email: null, contact: null },
      { name: "Little Orbit", url: "https://www.littleorbit.com/jobs/", email: null, contact: null },
      { name: "Look North World", url: "https://looknorth.world/careers", email: null, contact: null },
      { name: "Lucas Films", url: "https://www.lucasfilm.com/get-in-the-door/", email: null, contact: null },
      { name: "Lunacy Studios", url: "https://lunacystudios.com/careers/", email: null, contact: null },
      { name: "Mandorium", url: "https://www.madorium.com/jobs", email: null, contact: null },
      { name: "Magic Fuel Games", url: "https://www.magicfuelgames.com/open-position", email: null, contact: null },
      { name: "Magic Soup Games", url: "https://magicsoup.com/#careers", email: null, contact: null },
      { name: "Magnopus", url: "https://www.magnopus.com/current-openings", email: null, contact: null },
      { name: "Manticore Games", url: "https://www.manticoregames.com/careers/", email: null, contact: null },
      { name: "Marvel Games", url: "https://www.marvel.com/games", email: null, contact: null },
      { name: "Mass Media Games", url: "https://www.massmedia.com/careers.html", email: null, contact: null },
      { name: "Maxis Studios", url: "https://www.ea.com/ea-studios/maxis/careers", email: null, contact: null },
      { name: "Mobilityware", url: "https://www.mobilityware.com/jobs/", email: null, contact: null },
      { name: "Mobius Digital", url: "https://www.mobiusdigitalgames.com/jobs.html", email: null, contact: null },
      { name: "Monomi Park", url: "https://monomipark.com/careers/", email: null, contact: null },
      { name: "Monsarrat", url: "https://monsarrat.com/join/", email: null, contact: null },
      { name: "Moonbug", url: "https://www.moonbug.com/life-at-us-offices", email: null, contact: null },
      { name: "Moonshot Games", url: "https://www.dreamhaven.com/moonshot", email: null, contact: null },
      { name: "N3twork Studios", url: "https://www.n3twork.com/careers/", email: null, contact: null },
      { name: "Nant Games", url: "https://nantgames.com/", email: null, contact: null },
      { name: "Naughty Dog", url: "https://www.naughtydog.com/careers", email: null, contact: null },
      { name: "NetEase", url: "https://www.neteasegames.com/", email: null, contact: null },
      { name: "Netflix", url: "https://jobs.netflix.com/", email: null, contact: null },
      { name: "Never Forget Games", url: "https://neverforgetgames.com/#careers", email: null, contact: null },
      { name: "Nexus Studios", url: "https://apply.workable.com/nexusstudios/", email: null, contact: null },
      { name: "NHN Entertainment", url: "https://careers.nhn.com/", email: null, contact: null },
      { name: "Niantic", url: "https://careers.scopely.com/us/en", email: null, contact: null },
      { name: "Notorious Studios", url: "https://www.notorious.gg/careers", email: null, contact: null },
      { name: "Obsidian Entertainment", url: "https://www.obsidian.net/careers", email: null, contact: null },
      { name: "Otherside Entertainment", url: "https://careers.otherside-e.com/", email: null, contact: null },
      { name: "Pixelberry Studios", url: "https://www.pixelberrystudios.com/careers", email: null, contact: null },
      { name: "Plaiful", url: "https://www.plaiful.ai/#jobs", email: null, contact: null },
      { name: "Playable Worlds", url: "https://www.playableworlds.com/careers/", email: null, contact: null },
      { name: "Playco", url: "https://www.play.co/career", email: null, contact: null },
      { name: "Playgig", url: "https://jobs.ashbyhq.com/playgig", email: null, contact: null },
      { name: "PlayQ", url: "https://www.playq.com/careers", email: null, contact: null },
      { name: "Playsaurus", url: "https://playsaurus.com/jobs", email: null, contact: null },
      { name: "Play Studios", url: "https://www.playstudios.com/careers/", email: null, contact: null },
      { name: "Pontoco", url: "https://pontoco.com/jobs", email: null, contact: null },
      { name: "Product Madness", url: "https://www.productmadness.com/careers/", email: null, contact: null },
      { name: "Protagonist Games", url: "https://protagonistgames.com/#careers", email: null, contact: null },
      { name: "Psyonix", url: "https://www.psyonix.com/", email: null, contact: null },
      { name: "Raid Base", url: "https://www.raidbase.com/join", email: null, contact: null },
      { name: "Ramen VR", url: "https://www.ramenvr.com/careers", email: null, contact: null },
      { name: "Rascal Games", url: "https://www.rascalgames.com/jobs", email: null, contact: null },
      { name: "Redemption Games", url: "https://www.redemptiongames.com/jobs/", email: null, contact: null },
      { name: "Refractor Games", url: "https://www.refactorgames.com/#careers", email: null, contact: null },
      { name: "Respawn Entertainment", url: "https://www.respawn.com/careers", email: null, contact: null },
      { name: "RGG Studio", url: "https://www.paycomonline.net/v4/ats/web.php/portal/E743DEB45C5896F708643C7D7B581397/career-page", email: null, contact: null },
      { name: "Rice Games", url: "https://ricegames.net/careers/", email: null, contact: null },
      { name: "Riot Games", url: "https://www.riotgames.com/en/work-with-us", email: null, contact: null },
      { name: "Ripple Effect", url: "https://www.ea.com/ea-studios/ripple-effect/careers", email: null, contact: null },
      { name: "Roblox", url: "https://careers.roblox.com/", email: null, contact: null },
      { name: "Roboto Games", url: "https://www.robotogames.com/careers", email: null, contact: null },
      { name: "Rockstar Games", url: "https://www.rockstargames.com/careers", email: null, contact: null },
      { name: "Room 8 Studio", url: "https://room8studio.com/careers/", email: null, contact: null },
      { name: "Run Games", url: "https://www.run-games.com/jobs", email: null, contact: null },
      { name: "S-Game", url: "http://s-game.com.cn/join.html", email: null, contact: null },
      { name: "San String Studio", url: "https://sansstrings.studio/careers/", email: null, contact: null },
      { name: "Sanzaru Games", url: "https://sanzaru.com/careers/", email: null, contact: null },
      { name: "Scopely", url: "https://careers.scopely.com/us/en", email: null, contact: null },
      { name: "SD Studio", url: "https://sonysandiegostudio.games/careers/", email: null, contact: null },
      { name: "Seasun Games", url: "https://job.seasungames.com/", email: null, contact: null },
      { name: "Second Dinner", url: "https://www.seconddinner.com/careers/", email: null, contact: null },
      { name: "Secret 6", url: "https://apply.workable.com/secret-6/", email: null, contact: null },
      { name: "Secret Door", url: "https://www.dreamhaven.com/careers", email: null, contact: null },
      { name: "Seeker Entertainment", url: "https://playkinforge.com/#community", email: null, contact: null },
      { name: "Sega", url: "https://www.sega.com/life-at-sega", email: null, contact: null },
      { name: "Series Entertainment", url: "https://series.inc/careers/", email: null, contact: null },
      { name: "Shiny Shoe", url: "https://shinyshoe.com/careers/", email: null, contact: null },
      { name: "Shoreline Games", url: "https://shorelinegames.com/careers/", email: null, contact: null },
      { name: "Singularity 6", url: "https://singularity6.com/careers", email: null, contact: null },
      { name: "Six Foot", url: "https://www.6ft.com/about/#careers", email: null, contact: null },
      { name: "Sky Lantern Studios", url: "https://www.skylanternstudios.com/careers", email: null, contact: null },
      { name: "Skyborne Games", url: "https://www.skybornegames.com/careers.html", email: null, contact: null },
      { name: "Skybound", url: "https://www.skybound.com/careers", email: null, contact: null },
      { name: "Skydance", url: "https://skydance.com/careers/", email: null, contact: null },
      { name: "Sledgehammer Games", url: "https://careers.sledgehammergames.com/", email: null, contact: null },
      { name: "Snail Games", url: "https://snail.com/careers", email: null, contact: null },
      { name: "Solid State", url: "https://www.solidstate.com/#careers", email: null, contact: null },
      { name: "Sony", url: "https://careers.playstation.com/", email: null, contact: null },
      { name: "Sperasoft", url: "https://apply.workable.com/sperasoft/", email: null, contact: null },
      { name: "Squanch Games", url: "https://squanchgames.com/jobs/", email: null, contact: null },
      { name: "Square Enix", url: "https://www.square-enix-games.com/en_US/careers", email: null, contact: null },
      { name: "Steel Wool Studios", url: "https://steelwoolstudios.com/careers/", email: null, contact: null },
      { name: "Stoke Games", url: "https://www.stoke.games/careers", email: null, contact: null },
      { name: "Storm 8", url: "https://www.storm8.com/careers/", email: null, contact: null },
      { name: "Super Evil Megacorp", url: "https://superevilmegacorp.com/careers/", email: null, contact: null },
      { name: "Super Free Games", url: "https://superfree.com/careers/", email: null, contact: null },
      { name: "Supercell", url: "https://supercell.com/en/careers/", email: null, contact: null },
      { name: "SuperDuperSecret", url: "https://www.superdupersecret.co/careers/", email: null, contact: null },
      { name: "Survios", url: "https://survios.com/studio/careers/", email: null, contact: null },
      { name: "TapBlaze", url: "https://www.tapblaze.com/career/", email: null, contact: null },
      { name: "Telltale Games", url: "https://www.telltale.com/careers/", email: null, contact: null },
      { name: "Tempo Games", url: "https://tempogames.com/careers/", email: null, contact: null },
      { name: "Tencent", url: "https://careers.tencent.com/", email: null, contact: null },
      { name: "Tender Claws", url: "https://tenderclaws.com/jobs", email: null, contact: null },
      { name: "That's No Moon", url: "https://thatsnomoon.com/careers", email: null, contact: null },
      { name: "thatgamecompany", url: "https://thatgamecompany.com/careers/", email: null, contact: null },
      { name: "The Game Band", url: "https://thegameband.com/careers", email: null, contact: null },
      { name: "The Odd Gentlemen", url: "https://www.theoddgentlemen.com/careers", email: null, contact: null },
      { name: "The Third Floor", url: "https://thethirdfloorinc.com/careers/", email: null, contact: null },
      { name: "Theorycraft Games", url: "https://www.theorycraftgames.com/careers", email: null, contact: null },
      { name: "Tic Toc Games", url: "https://tictocgames.com/jobs/", email: null, contact: null },
      { name: "Timi Studios", url: "https://www.timistudios.com/#careers", email: null, contact: null },
      { name: "Together Labs", url: "https://togetherlabs.com/careers/", email: null, contact: null },
      { name: "Treyarch", url: "https://www.treyarch.com/careers", email: null, contact: null },
      { name: "Turn Me Up Games", url: "https://www.turnmeup.la/careers", email: null, contact: null },
      { name: "Turtle Rock Studios", url: "https://www.turtlerockstudios.com/careers", email: null, contact: null },
      { name: "Unbroken Studios", url: "https://unbrokenstudios.com/", email: null, contact: null },
      { name: "Underwater Fire Games", url: "https://www.underwaterfiregames.com/jobs", email: null, contact: null },
      { name: "Unfold Games", url: "https://unfoldgames.org/jobs/", email: null, contact: null },
      { name: "Unico Studio", url: "https://unicostudio.co/careers", email: null, contact: null },
      { name: "Unit 9", url: "https://www.unit9.com/jobs", email: null, contact: null },
      { name: "Unknown Worlds", url: "https://www.unknownworlds.com/en/careers", email: null, contact: null },
      { name: "VC Mobile Entertainment", url: "http://vcmobile.net/#Careers", email: null, contact: null },
      { name: "Versus Evil", url: "https://versusevil.com/careers/", email: null, contact: null },
      { name: "Vertigo Games", url: "https://www.vertigo-games.com/jobs/", email: null, contact: null },
      { name: "Visual Concepts", url: "https://vcentertainment.com/careers/", email: null, contact: null },
      { name: "Vivix", url: "https://vivix.us/careers/", email: null, contact: null },
      { name: "Walt Disney", url: "https://sites.disney.com/waltdisneyimagineering/careers/", email: null, contact: null },
      { name: "Warner Bros", url: "https://careers.wbd.com/global/en/search-results", email: null, contact: null },
      { name: "We The Force", url: "https://wetheforcestudios.com/", email: null, contact: null },
      { name: "Weekend", url: "https://www.weekend.com/careers", email: null, contact: null },
      { name: "White Elk", url: "https://whiteelkstudios.com/index.php/careers/", email: null, contact: null },
      { name: "White Lotus Interactive", url: "https://www.whitelotusinteractive.com/jobs/", email: null, contact: null },
      { name: "WhiteMoon Dreams", url: "https://whitemoondreams.com/careers/#openings", email: null, contact: null },
      { name: "Wildflower Games", url: "https://wildflowergames.com/careers", email: null, contact: null },
      { name: "Wildlife Studios", url: "https://careers.wildlifestudios.com/", email: null, contact: null },
      { name: "Wonderstorm", url: "https://www.wonderstorm.net/careers", email: null, contact: null },
      { name: "Yacht Club Games", url: "https://www.yachtclubgames.com/careers/", email: null, contact: null },
      { name: "Yotta Studios", url: "https://yottastudios.us/searchJobs", email: null, contact: null },
      { name: "ZeniMax Studios", url: "https://www.zenimaxonline.com/en-us/careers", email: null, contact: null },
      { name: "Zynga", url: "https://job-boards.greenhouse.io/zyngacareers", email: null, contact: null },
    ],
    "Colorado": [
      { name: "Battle Creek Games", url: "https://www.battlecreekgames.com/careers.html", email: "careers@battlecreekgames.com", contact: null },
      { name: "BitKraft", url: "https://careers.bitkraft.vc/jobs", email: null, contact: null },
      { name: "Deck Nine Games", url: "https://deckninegames.com/careers/", email: "jobs@deckninegames.com", contact: null },
      { name: "Dire Wolf Digital", url: "https://www.direwolfdigital.com/careers/", email: "info@direwolfdigital.com", contact: null },
      { name: "IllFonic", url: "https://illfonic.breezy.hr/", email: null, contact: null },
      { name: "Monster Theater Games", url: "https://docs.google.com/forms/d/e/1FAIpQLScssViQlK9BDwHw__PXeuQudF-kNA8lWarTuDlLGapX01XpYQ/viewform", email: "contact@monstertheater.games", contact: null },
      { name: "Operative Games", url: "https://www.operativegames.ai/careers/", email: null, contact: "https://www.operativegames.ai/contact-us/" },
      { name: "Pavonis Interactive", url: "https://www.pavonisinteractive.com/jobs.htm", email: "outreach@pavonisinteractive.com", contact: null },
      { name: "Serenity Forge", url: "https://www.serenityforge.com/careers", email: "jobs@serenityforge.com", contact: null },
    ],
    "Connecticut": [
      { name: "Fire Fly Studios", url: "https://fireflyworlds.com/", email: null, contact: "https://firefly-studios.helpshift.com/hc/en/3-firefly-studios/contact-us/" },
    ],
    "Delaware": [
      { name: "Kevuru Games", url: "https://kevurugames.com/", email: "career@kevurugames.com", contact: "https://kevurugames.com/contact-us/" },
      { name: "Made on Earth Games", url: "https://www.madeonearth.games/", email: "jobs@madeonearth.games", contact: null },
    ],
    "Florida": [
      { name: "A Square Games", url: "https://asgs.studio/careers/", email: null, contact: "https://asgs.studio/contact/" },
      { name: "Chromatic Games", url: "https://chromatic.games/careers/", email: null, contact: null },
      { name: "EA", url: "https://jobs.ea.com/en_US/careers/Home/?4538=8356&4538_format=3021&listFilterMode=1", email: null, contact: null },
      { name: "Game Artists", url: "https://www.gameartists.com/#jobs", email: "info@gameartists.com", contact: null },
      { name: "Game Sim", url: "https://apply.workable.com/gamesim-2/", email: null, contact: null },
      { name: "Good Dog Studios", url: "https://www.gooddogstudios.com/careers", email: "contact@gooddogstudios.com", contact: null },
      { name: "Greatsword Game Studio", url: "https://www.greatswordgames.com/careers", email: "greatswordstudios@gmail.com", contact: null , volunteer:true },
      { name: "Grove Street Games", url: "https://grovestreetgames.com/careers/", email: "jobs@grovestreetgames.com ", contact: null },
      { name: "Helm Systems", url: "https://www.helmsystems.com/copy-of-about-1", email: null, contact: null },
      { name: "Magic Find Studios", url: "https://www.magicfindstudios.com", email: null, contact: null },
      { name: "Motorsport Games", url: "https://motorsportgames.bamboohr.com/careers", email: null, contact: null },
      { name: "Shiver Entertainment", url: "https://www.shiver.net", email: "cvs@shiver.net", contact: null , emailApply:true },
      { name: "Sword and Wand", url: "https://swordandwand.com/careers", email: "careers@swordandwand.com", contact: "https://swordandwand.com/contact" },
      { name: "Studio Wildcard", url: "https://www.studiowildcard.com/", email: null, contact: null },
      { name: "Theory Studios", url: "https://www.theorystudios.com/jobs/none", email: null, contact: null },
    ],
    "Georgia": [
      { name: "AGS", url: "https://jobs.jobvite.com/agscareer", email: null, contact: "https://www.playags.com/operations-and-contact/get-in-touch" },
      { name: "Evil Mojo Games", url: "https://www.evilmojogames.com/", email: "evilmojogames@hirezstudios.com", contact: null , emailApply:true },
      { name: "Gimme Games", url: "https://www.gimmiegames.com/careers", email: "info@gimmiegames.com", contact: null },
      { name: "Hi-Rez Studios", url: "https://hirezstudios.applytojob.com/apply/", email: null, contact: null },
      { name: "Prophecy Games", url: "https://www.prophecygames.com/careers", email: null, contact: "https://www.prophecygames.com/contact" },
      { name: "Templar Media", url: "https://templarmedia.com/careers", email: "contact@templarmedia.com", contact: "https://templarmedia.com/contact" },
      { name: "Titan Forge", url: "https://www.titanforgegames.com/", email: "titanforgegames@hirezstudios.com", contact: null },
      { name: "Tripwire Interactive", url: "https://tripwireinteractive.com/#/careers", email: null, contact: null },
    ],
    "Idaho": [
      { name: "Curious Media", url: "https://www.curiousmedia.com/careers/", email: "jobs@curiousmedia.com", contact: "info@curiousmedia.com" , emailApply:true },
      { name: "Mighty Coconut", url: "https://www.mightycoconut.com/jobs", email: "jobs@mightycoconut.com", contact: null },
    ],
    "Illinois": [
      { name: "Everi", url: "https://www.everi.com/careers-culture/", email: null, contact: null },
      { name: "High Voltage", url: "https://kwshighvoltage.wpengine.com/careers/#current_open_mn_otr", email: null, contact: "https://www.high-voltage.com/contact-us/" },
      { name: "Incredible Technologies", url: "https://www.paycomonline.net/v4/ats/web.php/portal/E5AB5DF55CA4B4A7A03AAF06F70FF8EF/career-page", email: null, contact: null },
      { name: "Iron Galaxy Studios", url: "https://www.irongalaxystudios.com/careers", email: "communications@irongalaxystudios.com", contact: "https://www.irongalaxystudios.com/contact" },
      { name: "Jackbox Games", url: "https://apply.workable.com/jackbox-games/?lng=en", email: null, contact: null },
      { name: "King", url: "https://careers.king.com/us/en/search-results", email: null, contact: null },
      { name: "Netherrealm Studios", url: "https://www.netherrealm.com/careers/", email: null, contact: null },
      { name: "Perfect Garbage Studios", url: "https://shapeshiftergames.applytojob.com/", email: null, contact: "https://www.perfectgarbage.com/contact" },
      { name: "Shapeshifter Games", url: "https://shapeshiftergames.com/#jobs", email: "info@shapeshiftergames.com", contact: null },
    ],
    "Iowa": [
      { name: "Jam City", url: "https://www.jamcity.com/job-openings/", email: null, contact: null },
      { name: "SciPlay", url: "https://www.sciplay.com/careers", email: null, contact: null },
    ],
    "Kansas": [
      { name: "Bad Rhino Games", url: "https://www.badrhinogames.com/careers/", email: null, contact: "https://www.badrhinogames.com/contact-us/" },
      { name: "Scopely", url: "https://careers.scopely.com/us/en", email: null, contact: null },
    ],
    "Louisiana": [
      { name: "High Voltage", url: "https://kwshighvoltage.wpengine.com/careers/#current_open_mn_otr", email: null, contact: "https://www.high-voltage.com/contact-us/" },
      { name: "InXile", url: "https://www.inxile-entertainment.com/careers", email: "jobs@inxile.net", contact: null },
      { name: "Pixel Dash Studios", url: "https://www.pixeldashstudios.com/jobs.html", email: "contact@pixeldashstudios.com", contact: null , emailApply:true },
      { name: "Undead Labs", url: "https://www.undeadlabs.com/careers", email: null, contact: null },
    ],
    "Maine": [
      { name: "Activision Portland", url: "https://www.activision.com/", email: null, contact: null },
    ],
    "Maryland": [
      { name: "Bethesda Game Studios", url: "https://bethesdagamestudios.com/", email: null, contact: null },
      { name: "Big Huge Games", url: "https://bighugegames.com/careers/", email: null, contact: "https://bighugegames.com/contact-us/" },
      { name: "Bit Reactor", url: "https://www.bitreactor.com/careers/", email: null, contact: "https://www.bitreactor.com/contact-us/" },
      { name: "Break Away Games", url: "https://www.breakawaygames.com/careers/", email: null, contact: "https://www.breakawaygames.com/contact-us/" , emailApply:true },
      { name: "Bully Entertainment", url: "https://bullyentertainment.com/", email: null, contact: null },
      { name: "Exis Interactive", url: "https://www.exisinteractive.com/", email: null, contact: null },
      { name: "Firaxis", url: "https://www.firaxis.com/", email: null, contact: null },
      { name: "Midsummer Studios", url: "https://www.midsummerstudios.com/", email: null, contact: null },
      { name: "Mohawk Games", url: "https://mohawkgames.com/", email: null, contact: null },
      { name: "Oxide Games", url: "https://www.oxidegames.com/", email: null, contact: null },
      { name: "Pure Bang", url: "http://purebang.com/", email: null, contact: null },
      { name: "Starcaster Games", url: "https://starcaster.games/", email: null, contact: null },
      { name: "ZeniMax", url: "https://www.zenimax.com/en", email: null, contact: null },
    ],
    "Massachusetts": [
      { name: "Camlann Games", url: "https://camlanngames.com/", email: null, contact: null },
      { name: "CD Projekt Red", url: "https://www.cdprojektred.com/en", email: null, contact: null },
      { name: "Crate Entertainment", url: "https://www.crateentertainment.com/", email: null, contact: null },
      { name: "Cryptyd Games", url: "https://cryptydgames.com/", email: null, contact: null },
      { name: "Decoy Games", url: "https://www.decoygames.com/", email: null, contact: null },
      { name: "Deep End Games", url: "https://www.thedeependgames.com/", email: null, contact: null },
      { name: "Demiurge", url: "https://demiurgestudios.com/", email: null, contact: null },
      { name: "Fable Vision Studios", url: "https://www.fablevisionstudios.com/", email: null, contact: null },
      { name: "Firehose Games", url: "https://www.firehosegames.com/", email: null, contact: null },
      { name: "First Break Labs", url: "http://firstbreaklabs.com/", email: null, contact: null },
      { name: "Ghost Story Games", url: "https://www.ghoststorygames.com/", email: null, contact: null },
      { name: "Harmonix", url: "https://www.harmonixmusic.com/", email: null, contact: null },
      { name: "Otherside Entertainment", url: "https://otherside-e.com/", email: null, contact: null },
      { name: "Outact", url: "https://www.outact.com/", email: null, contact: null },
      { name: "Skymap", url: "https://skymap.com/", email: null, contact: null },
      { name: "Storm Flag Games", url: "https://stormflaggames.com/", email: null, contact: null },
      { name: "Terrible Posture Games", url: "https://www.terribleposture.com/", email: null, contact: null },
      { name: "Warner Bros.", url: "https://careers.wbd.com/global/en/wb-games-jobs", email: null, contact: null },
      { name: "Zapdot", url: "https://www.zapdot.com/", email: null, contact: null },
      { name: "Zephyr Workshop", url: "https://zephyrworkshop.com/", email: null, contact: null },
    ],
    "Michigan": [
      { name: "Plarium", url: "https://plarium.com/", email: null, contact: null },
      { name: "Stardock", url: "https://www.stardock.com/careers", email: null, contact: null },
      { name: "You Pass Universe", url: "https://www.ypuniverse.com/career", email: null, contact: null },
    ],
    "Minnesota": [
      { name: "Drattzy Games", url: "https://alteriumshift.com/", email: null, contact: null },
      { name: "King Show Games", url: "https://www.ksg.com/careers", email: null, contact: null },
      { name: "Napnok Games", url: "https://napnokgames.com/all-jobs/", email: null, contact: null },
    ],
    "Missouri": [
      { name: "Mob Entertainment", url: "https://www.mobentertainment.com/", email: null, contact: null },
    ],
    "New Hampshire": [
      { name: "Virtual Basement", url: "https://virtualbasement.com/#", email: null, contact: null },
    ],
    "New Jersey": [
      { name: "High 5 Games", url: "https://high5games.com/", email: null, contact: null },
      { name: "Kalypso Media", url: "https://www.kalypsomedia.com/", email: null, contact: null },
      { name: "N Fusion", url: "https://www.n-fusion.com/", email: null, contact: null },
      { name: "Saber Interactive", url: "https://saber.games/", email: null, contact: null },
    ],
    "New York": [
      { name: "Amazon Game Studios", url: "https://www.amazongamestudios.com/en-us/careers", email: null, contact: null },
      { name: "Atomic Theory(Rocket Science)", url: "https://www.atomictheory.gg", email: null, contact: null },
      { name: "Avalanche Studios", url: "https://avalanchestudios.com", email: null, contact: null },
      { name: "Blizzard Entertainment", url: "https://www.blizzard.com/en-us/", email: null, contact: null },
      { name: "Brass Lion Entertainment", url: "https://www.brasslionentertainment.com", email: null, contact: null },
      { name: "Burgee Studio", url: "https://burgeemedia.studio", email: null, contact: null },
      { name: "CI Games", url: "https://cigames.com/en/", email: null, contact: null },
      { name: "Darkwind Media", url: "https://www.darkwindmedia.com", email: null, contact: null },
      { name: "Experiment 7", url: "https://www.experiment7.com", email: null, contact: null },
      { name: "Gameloft", url: "https://www.gameloft.com", email: null, contact: null },
      { name: "Half Mermaid", url: "https://halfmermaid.co", email: null, contact: null },
      { name: "Impeller Studios", url: "https://impellerstudios.com", email: null, contact: null },
      { name: "King", url: "https://www.king.com", email: null, contact: null },
      { name: "Liquid Swords", url: "https://www.liquidswords.com", email: null, contact: null },
      { name: "Muse Games", url: "https://musegames.com", email: null, contact: null },
      { name: "People Can Fly", url: "https://peoplecanfly.com", email: null, contact: null },
      { name: "Riftweaver", url: "https://riftweaver.com", email: null, contact: null },
      { name: "Riot Games", url: "https://www.riotgames.com/en", email: null, contact: null },
      { name: "Rockstar", url: "https://www.rockstargames.com", email: null, contact: null },
      { name: "Take-Two Interactive", url: "https://www.take2games.com", email: null, contact: null },
      { name: "THQNordic", url: "https://thqnordic.com", email: null, contact: null },
      { name: "Top Hat Studios", url: "https://tophat.studio/index.html", email: null, contact: null },
      { name: "Velan Studios", url: "https://www.velanstudios.com", email: null, contact: null },
      { name: "Wolfjaw Studios", url: "https://wolfjawstudios.com", email: null, contact: null },
      { name: "Workin Man Interactive", url: "https://workinman.com", email: null, contact: null },
      { name: "Zynga", url: "https://www.zynga.com", email: null, contact: null },
    ],
    "North Carolina": [
      { name: "Crater Studios", url: "https://craterstudiosgames.com/careers", email: null, contact: null },
      { name: "Imangi", url: "https://imangistudios.com/careers/", email: null, contact: null },
      { name: "Methodical", url: "https://www.methodical.com/careers", email: null, contact: null },
      { name: "Squanch Games", url: "https://squanchgames.com/jobs/", email: null, contact: null },
      { name: "Studio Hermitage", url: "http://www.studio-hermitage.com/careers/", email: null, contact: null },
      { name: "Third Pie Studios", url: "https://thirdpiestudios.com/careers", email: null, contact: null },
      { name: "Vavel Games", url: "https://careers.vavel.gs/", email: null, contact: null },
      { name: "WDR Studios", url: "https://www.wdrstudios.com/careers", email: null, contact: null },
      { name: "Zapper Games", url: "https://jobs.zapper.games/#jobs", email: null, contact: null },
    ],
    "Ohio": [
      { name: "Square Table Games", url: "https://www.soulspires.com/", email: null, contact: null },
    ],
    "Oregon": [
      { name: "Brainum", url: "https://brainium.com/careers/", email: null, contact: null },
      { name: "Nightdive Studios", url: "https://job-boards.greenhouse.io/nightdivestudios", email: null, contact: null },
      { name: "Pipeworks", url: "https://www.pipeworks.com/new-careers/", email: null, contact: null },
      { name: "Bend Studio", url: "https://www.bendstudio.com/careers", email: null, contact: null },
      { name: "Wicked Saints Studio", url: "https://www.wickedsaints.studio/hiring", email: null, contact: null },
    ],
    "Pennsylvania": [
      { name: "Bigger Boss Games", url: "https://www.biggerbossgames.com/", email: null, contact: null },
      { name: "Dynasty Studios", url: "https://dynastystudios.io/", email: null, contact: null },
      { name: "Mega Cat Studios", url: "https://megacatstudios.com/", email: null, contact: null },
      { name: "Schell Games", url: "https://schellgames.com/", email: null, contact: null },
    ],
    "Remote": [
      { name: "Thought Pennies", url: "https://thought-pennies.careers-page.com/", email: null, contact: null },
      { name: "Fortis Games", url: "https://www.fortisgames.com/en-us/careers", email: null, contact: null },
      { name: "ZeniMax Online Studios", url: "https://www.zenimaxonline.com/en-us/home", email: null, contact: null },
    ],
    "Rhode Island": [
      { name: "Orion Games", url: "https://oriongames.net/", email: null, contact: null },
      { name: "Unleashed Games", url: "https://www.unleashedgames.com/", email: null, contact: null },
    ],
    "Tennessee": [
      { name: "Traega Entertainment", url: "https://www.traega.com/", email: null, contact: null },
      { name: "Turning Wheel Games", url: "https://www.turningwheelgames.com/#games", email: null, contact: null },
    ],
    "Texas": [
      { name: "Ares Interactive", url: "https://aresinteractive.com/careers/", email: null, contact: null },
      { name: "Avore", url: "https://arvore.io/work-with-us", email: null, contact: null },
      { name: "Aspyr", url: "https://aspyr.com/careers", email: null, contact: null },
      { name: "Astro Beam", url: "https://www.astrobeam.com/jobs", email: null, contact: null },
      { name: "Atomic Theory", url: "https://www.rocketscience.gg/careers/", email: null, contact: null },
      { name: "BioWare", url: "https://www.bioware.com/careers/", email: null, contact: null },
      { name: "Blind Squirrel Games", url: "https://blindsquirrelentertainment.com/careers", email: null, contact: null },
      { name: "Boss Fight Entertainment", url: "https://www.bossfightentertainment.com/careers", email: null, contact: null },
      { name: "C Prompt Games", url: "https://www.cpromptgames.com/careers", email: null, contact: null },
      { name: "Cards and Tankards", url: "https://cardsandtankards.com/careers", email: null, contact: null },
      { name: "Cat Face", url: "https://www.catface.com/careers", email: null, contact: null },
      { name: "Certain Affinity", url: "https://www.certainaffinity.com/careers/", email: null, contact: null },
      { name: "Cire Games", url: "https://ciregames.com/Careers/", email: null, contact: null },
      { name: "Cloud Imperium Games", url: "https://cloudimperiumgames.com/join-us", email: null, contact: null },
      { name: "Cooldown Games", url: "https://cooldowngames.com/careers/", email: null, contact: null },
      { name: "Crystal Dynamics", url: "https://www.crystaldynamics.com/careers/", email: null, contact: null },
      { name: "Daybreak Games", url: "https://www.daybreakgames.com/careers?locale=en_US", email: null, contact: null },
      { name: "Deadmage Games", url: "https://deadmage.com/#about-us", email: null, contact: null },
      { name: "Devolver Digital", url: "https://www.devolverdigital.com/jobs", email: null, contact: null },
      { name: "Dimensional Link", url: "https://www.dimensionalink.com/careers", email: null, contact: null },
      { name: "Elon’s Game & Arts", url: "https://www.elosgames.net/about-us", email: null, contact: null },
      { name: "Empty Vessel", url: "https://emptyvessel.io/jobs/", email: null, contact: null },
      { name: "Enduring Games", url: "https://enduring.games/jobs/", email: null, contact: null },
      { name: "Farbridge", url: "https://farbridge.com/careers", email: null, contact: null },
      { name: "Forward XP", url: "https://forwardxp.com/careers/", email: null, contact: null },
      { name: "From the Future", url: "https://ftfvr.com/careers/", email: null, contact: null },
      { name: "Game Circus", url: "https://www.gamecircus.com/careers/", email: null, contact: null },
      { name: "Game Salad", url: "https://gamesalad.com/jobs/", email: null, contact: null },
      { name: "Gearbox", url: "https://www.gearboxsoftware.com/careers/", email: null, contact: null },
      { name: "Golf+", url: "https://www.golfplusvr.com/careers", email: null, contact: null },
      { name: "Groove Jones", url: "https://www.groovejones.com/workwithus", email: null, contact: null },
      { name: "Gunfire Games", url: "https://gunfiregames.com/careers", email: null, contact: null },
      { name: "Hyper Beard", url: "https://hyperbeard.com/jobs/", email: null, contact: null },
      { name: "ID Software", url: "https://www.idsoftware.com/en", email: null, contact: null },
      { name: "Infernozilla", url: "https://www.infernozilla.com/careers", email: null, contact: null },
      { name: "Infinityward", url: "https://careers.infinityward.com", email: null, contact: null },
      { name: "Kabam", url: "https://kabam.com/careers/", email: null, contact: null },
      { name: "Kalani Games", url: "https://www.kalanigames.com/careers.html", email: null, contact: null },
      { name: "KingsIsle Entertainment", url: "https://apply.workable.com/kingsisle-entertainment-inc/", email: null, contact: null },
      { name: "Lost Boys Interactive", url: "https://lostboysinteractive.applytojob.com/apply", email: null, contact: null },
      { name: "Mad Mushroom", url: "https://apply.workable.com/otk-media/", email: null, contact: null },
      { name: "Maxis", url: "https://www.ea.com/ea-studios/maxis/careers", email: null, contact: null },
      { name: "Meta 3D Studios", url: "https://www.meta3dstudios.com/jobs/", email: null, contact: null },
      { name: "Mighty Coconut", url: "https://www.mightycoconut.com/jobs", email: null, contact: null },
      { name: "Moon Beast Productions", url: "https://www.moonbeast.com/careers", email: null, contact: null },
      { name: "Natural Motion", url: "https://www.naturalmotion.com", email: null, contact: null },
      { name: "Otherside Entertainment", url: "https://careers.otherside-e.com", email: null, contact: null },
      { name: "Owlchemy Labs", url: "https://owlchemylabs.com/career", email: null, contact: null },
      { name: "Panic Button Games", url: "https://panicbuttongames.com/careers/", email: null, contact: null },
      { name: "Paralune", url: "http://paralune.com/jobs/", email: null, contact: null },
      { name: "Peoplefun", url: "https://www.peoplefun.com/careers", email: null, contact: null },
      { name: "Play Studios", url: "https://www.playstudios.com", email: null, contact: null },
      { name: "Resolution Games", url: "https://jobs.resolutiongames.com", email: null, contact: null },
      { name: "Retro Studios", url: "https://careers.nintendo.com/studios/retro-studios/", email: null, contact: null },
      { name: "Robot Entertainment", url: "https://robotentertainment.com/careers", email: null, contact: null },
      { name: "Rukus Games", url: "https://careers.ruckus-games.com", email: null, contact: null },
      { name: "Sickhead Games", url: "https://sickheadgames.com", email: null, contact: null },
      { name: "Skeleton Key Studios", url: "https://skeletonkeystudio.com", email: null, contact: null },
      { name: "Stray Kite Studios", url: "https://www.straykitestudios.com/careers", email: null, contact: null },
      { name: "Terminal Velocity", url: "https://www.rocketscience.gg/careers/", email: null, contact: null },
      { name: "Trick Studios", url: "https://www.trickgs.com/jointrick", email: null, contact: null },
      { name: "Visual Concepts", url: "https://vcentertainment.com/careers/", email: null, contact: null },
      { name: "Wizards of the Coast", url: "https://company.wizards.com/en/careers", email: null, contact: null },
    ],
    "Utah": [
      { name: "Avalanche", url: "https://www.avalanchesoftware.com/en/careers/", email: null, contact: null },
    ],
    "Vermont": [
      { name: "Frame Interactive", url: "https://frameinteractive.com/", email: null, contact: null },
    ],
    "Virginia": [
      { name: "2 Wedges", url: "https://www.2wedges.com/", email: null, contact: null },
      { name: "D-Cell Games", url: "https://www.unbeatablegame.com/", email: null, contact: null },
      { name: "Guilty Games", url: "https://guiltygames.com/", email: null, contact: null },
      { name: "Little Arms Studios", url: "https://www.littlearmsstudios.com/", email: null, contact: null },
      { name: "Loric Games", url: "https://www.loricgames.com/", email: null, contact: null },
      { name: "Two Robots Studios", url: "https://tworobots.com/", email: null, contact: null },
      { name: "Unchained Entertainment", url: "https://www.unchained-entertainment.com/", email: null, contact: null },
      { name: "Yarnhub", url: "https://www.yarnhub.org/", email: null, contact: null },
      { name: "Zojoi", url: "https://www.zojoi.com/", email: null, contact: null },
    ],
    "Washington": [
      { name: "775 Interactive", url: "https://www.775int.com/#jobs", email: null, contact: null },
      { name: "Aether Studios", url: "https://aetherstudios.com/jobs/", email: null, contact: null },
      { name: "Aggrocrab Games", url: "https://aggrocrab.com/Jobs", email: null, contact: null },
      { name: "Amazon Games", url: "https://www.amazongamestudios.com/en-us/careers", email: null, contact: null },
      { name: "Arena", url: "https://www.arena.net/en/careers", email: null, contact: null },
      { name: "Ballard Games", url: "https://www.ballardgames.com/careers/index.html", email: null, contact: null },
      { name: "Big Box VR", url: "https://www.bigboxvr.com/careers.html", email: null, contact: null },
      { name: "Bungie", url: "https://careers.bungie.com/jobs?_gl=1*6n4bmh*_gcl_au*MTc1MDAxNzU3Ni4xNzgwMjM3NjU1", email: null, contact: null },
      { name: "C77 Entertainment", url: "https://www.c77.live", email: null, contact: null },
      { name: "Cat Daddy Games", url: "https://job-boards.greenhouse.io/catdaddy", email: null, contact: null },
      { name: "Chronicler Software", url: "https://www.chroniclersoftware.com/careers", email: null, contact: null },
      { name: "Cold Symmetry", url: "https://www.coldsymmetry.com/jobs", email: null, contact: null },
      { name: "Crystal Dynamics", url: "https://www.crystaldynamics.com/careers/", email: null, contact: null },
      { name: "Cyan", url: "https://cyan.com/company/careers/", email: null, contact: null },
      { name: "Dark Arts Software", url: "https://darkartssoftware.com/jobs", email: null, contact: null },
      { name: "Double Down Interactive", url: "https://jobs.lever.co/doubledown", email: null, contact: null },
      { name: "Dragon Snacks Games", url: "https://www.dragonsnacksgames.com/careers", email: null, contact: null },
      { name: "Drifter Games", url: "https://drifter.games/careers/", email: null, contact: null },
      { name: "East Shade", url: "https://eastshade.com/jobs/", email: null, contact: null },
      { name: "Final Strike Games", url: "https://finalstrikegames.net/#careers", email: null, contact: null },
      { name: "Flowplay", url: "https://flowplay-llc.breezy.hr", email: null, contact: null },
      { name: "Galvanic Games", url: "https://galvanicgames.com", email: null, contact: null },
      { name: "Gameloft", url: "https://www.gameloft.com/careers", email: null, contact: null },
      { name: "Hardsuit Labs", url: "https://www.hardsuitlabs.com/careers", email: null, contact: null },
      { name: "Hasbro", url: "https://play.hasbro.com/en-ca", email: null, contact: null },
      { name: "Gideon Path Entertainment", url: "https://www.hiddenpath.com/join-us/", email: null, contact: null },
      { name: "Highwire Games", url: "https://www.sixdays.com/careers", email: null, contact: null },
      { name: "House of How", url: "https://www.houseofhow.com/careers/", email: null, contact: null },
      { name: "Illfonic", url: "https://www.illfonic.com/careers/", email: null, contact: null },
      { name: "Koo Apps", url: "https://careerspage.io/kooapps-philippines", email: null, contact: null },
      { name: "Lightfox Games", url: "https://www.lightfoxgames.com/careers", email: null, contact: null },
      { name: "Lunacy Games", url: "https://lunacygames.com/#careers", email: null, contact: null },
      { name: "Nerd Ninjas", url: "https://nerdninjas.com/#careers", email: null, contact: null },
      { name: "Niantic", url: "https://www.scopely.com/en/join-us", email: null, contact: null },
      { name: "One More Game", url: "https://www.onemoregame.com/careers/", email: null, contact: null },
      { name: "Otherside Entertainment", url: "https://careers.otherside-e.com", email: null, contact: null },
      { name: "Pie Trap Studios", url: "https://www.pietrap.com/careers", email: null, contact: null },
      { name: "Pop Cap", url: "https://www.ea.com/ea-studios/popcap/careers", email: null, contact: null },
      { name: "Probably Monsters", url: "https://www.probablymonsters.com/en/careers/", email: null, contact: null },
      { name: "Real Networks", url: "https://realnetworks.com/careers", email: null, contact: null },
      { name: "Reflection Games", url: "https://www.reflection.games/join", email: null, contact: null },
      { name: "Seismic Squirrel", url: "https://www.seismicsquirrel.com/jobs", email: null, contact: null },
      { name: "Smile Break", url: "https://smile-break.com", email: null, contact: null },
      { name: "Soulbound Studios", url: "https://soulboundstudios.com/jobs.html", email: null, contact: null },
      { name: "Sound Games", url: "https://sound.games/careers.html", email: null, contact: null },
      { name: "Starform", url: "https://www.starform.co/careers", email: null, contact: null },
      { name: "Studio Wildcard", url: "https://www.studiowildcard.com/jobs", email: null, contact: null },
      { name: "System Era", url: "https://www.systemera.net/jobs", email: null, contact: null },
      { name: "Take 2 Interactive", url: "https://careers.take2games.com/jobs", email: null, contact: null },
      { name: "team LFG", url: "https://www.playstation.com/en-us/corporate/playstation-studios/teamlfg/", email: null, contact: null },
      { name: "The Pokemon Company", url: "https://job-boards.greenhouse.io/pokemoncareers", email: null, contact: null },
      { name: "Theorycraft Games", url: "https://www.theorycraftgames.com/careers", email: null, contact: null },
      { name: "Timi Studios", url: "https://www.timistudios.com/#careers", email: null, contact: null },
      { name: "Tiny Build", url: "https://www.tinybuild.com/jobs", email: null, contact: null },
      { name: "Unbound Creations", url: "https://unboundcreations.com/jobs/", email: null, contact: null },
      { name: "Unchained Entertainment", url: "https://www.unchained-entertainment.com/#join-us", email: null, contact: null },
      { name: "Undead Labs", url: "https://www.undeadlabs.com/careers", email: null, contact: null },
      { name: "Valve Software", url: "https://www.valvesoftware.com/en/", email: null, contact: null },
      { name: "What Up Games", url: "https://www.whatupgames.com/#careers", email: null, contact: null },
      { name: "Wildcard Games", url: "https://wildcardmobile.com", email: null, contact: null },
      { name: "Wizards of the Coast", url: "https://company.wizards.com/en/careers", email: null, contact: null },
      { name: "Worlds Edge", url: "https://www.ageofempires.com/careers/", email: null, contact: null },
    ],
    "Washington DC": [
      { name: "Something Wicked Games", url: "https://somethingwickedgames.com/careers/", email: null, contact: null },
    ],
    "West Virginia": [
      { name: "Lasso Games", url: "https://lassogames.com/lasso/", email: null, contact: null },
    ],
    "Wisconsin": [
      { name: "Filament Games", url: "https://www.filamentgames.com/careers/", email: null, contact: null },
      { name: "Lost Boys Interactive", url: "https://lostboysinteractive.applytojob.com/apply", email: null, contact: null },
      { name: "Raven Software", url: "https://careers.ravensoftware.com/", email: null, contact: null },
      { name: "Respawn Entertainment", url: "https://www.respawn.com/careers", email: null, contact: null },
    ],
    "Wyoming": [
      { name: "Venom Studio", url: "https://veomstudio.com/career", email: null, contact: null },
    ],
  },
  "Canada": {
    "Alberta": [
      { name: "Arcanaut Studios", url: "https://www.arcanautstudios.com/careers", email: null, contact: null },
      { name: "BioWare Edmonton", url: "https://www.bioware.com/careers/", email: null, contact: null },
      { name: "gSkinner", url: "https://gskinner.com/careers", email: null, contact: null },
      { name: "Instoinc", url: "https://www.istoinc.com/careers", email: null, contact: null },
      { name: "Theory Studios", url: "https://www.theorystudios.com/", email: null, contact: null },
    ],
    "British Columbia": [
      { name: "2k Sports Lab", url: "https://sportslab.2k.com/", email: null, contact: null },
      { name: "2TG Entertainment", url: "https://www.2tg.io/", email: null, contact: null },
      { name: "81 Monkeys", url: "https://www.81monkeys.com/jobs", email: null, contact: null },
      { name: "A Thinking Ape", url: "https://athinkingape.com/careers/", email: null, contact: null },
      { name: "Activision Vancouver", url: "https://careers.activision.com/", email: null, contact: null },
      { name: "Arcanaut Studios", url: "https://www.arcanautstudios.com/careers", email: null, contact: null },
      { name: "Blackbird Interactive", url: "https://blackbirdinteractive.com/", email: null, contact: null },
      { name: "Brace Yourself Games", url: "https://braceyourselfgames.com/careers/", email: null, contact: null },
      { name: "Brass Token", url: "https://brasstoken.com/#connect", email: null, contact: null },
      { name: "Buffalo Buffalo", url: "https://www.buffalobuffalo.ca/careers", email: null, contact: null },
      { name: "CD Projekt Red", url: "https://www.cdprojektred.com/en/jobs", email: null, contact: null },
      { name: "Conquer Experience", url: "https://conquerexperience.com/careers/", email: null, contact: null },
      { name: "Dapper Labs", url: "https://www.dapperlabs.com/careers", email: null, contact: null },
      { name: "Demonware", url: "https://www.demonware.net/careers", email: null, contact: null },
      { name: "Dogfish Games", url: "https://dogfishgames.com/jobs/", email: null, contact: null },
      { name: "Drop Fake", url: "https://www.dropfake.com/#careers", email: null, contact: null },
      { name: "EA Sports", url: "https://www.ea.com/ea-studios/ea-sports", email: null, contact: null },
      { name: "Eastside Games", url: "https://www.eastsidegames.com/jobs/", email: null, contact: null },
      { name: "Endnight Games", url: "https://endnightgames.com/careers", email: null, contact: null },
      { name: "Epic Games Vancouver", url: "https://www.epicgames.com/site/careers/jobs", email: null, contact: null },
      { name: "Fluffy Dog Studios", url: "https://www.fluffydogstudio.com/careers", email: null, contact: null },
      { name: "Fun Plus", url: "https://funplus.com/careers/", email: null, contact: null },
      { name: "Gasket Games", url: "https://gasketgames.bamboohr.com/careers", email: null, contact: null },
      { name: "Hellbent Games", url: "http://hellbentgames.com/careers/", email: null, contact: null },
      { name: "Hololabs", url: "https://hololabs.org/careers/", email: null, contact: null },
      { name: "Hyper Hippo Games", url: "https://hyperhippo.com/careers/", email: null, contact: null },
      { name: "Icefall Interactive", url: "https://icefall-interactive.com/jobs/", email: null, contact: null },
      { name: "IGG", url: "https://jobs.igg.com/public/", email: null, contact: null },
      { name: "Ironclad Games", url: "https://ironcladgames.com/?page_id=1390", email: null, contact: null },
      { name: "Iron Oak Games", url: "https://ironoakgames.com/careers/", email: null, contact: null },
      { name: "Jetpack Interactive", url: "https://www.jetpackinteractive.ca/careers", email: null, contact: null },
      { name: "Kabam", url: "https://kabam.com/careers/", email: null, contact: null },
      { name: "Kano", url: "https://www.kano.ca/careers", email: null, contact: null },
      { name: "Kerberos Productions", url: "https://www.kerberos-productions.com/", email: null, contact: null },
      { name: "Kixeye", url: "https://corp.kixeye.com/#careers", email: null, contact: null },
      { name: "Klei Entertainment", url: "https://www.klei.com/careers/", email: null, contact: null },
      { name: "Koolhaus Games", url: "https://koolhausgames.com/career.html", email: null, contact: null },
      { name: "LBC Studios", url: "https://lbcstudios.ca/careers/", email: null, contact: null },
      { name: "Maxis", url: "https://www.ea.com/ea-studios/maxis/careers", email: null, contact: null },
      { name: "Metalhead", url: "https://www.ea.com/ea-studios/metalhead/careers#roles", email: null, contact: null },
      { name: "Metanaut Labs", url: "https://metanautlabs.com/careers/", email: null, contact: null },
      { name: "Next Level Games", url: "https://nextlevelgames.com/jobs-at-next-level-games-subsidiary-of-nintendo-co-ltd/", email: null, contact: null },
      { name: "Night Garden Studio", url: "https://www.nightgardenstudio.com/careers", email: null, contact: null },
      { name: "Nightmarket Games", url: "https://nightmarket.games/careers/", email: null, contact: null },
      { name: "Offworld", url: "https://www.offworldindustries.com/careers", email: null, contact: null },
      { name: "Piranha Games", url: "https://piranhagames.com/careers/", email: null, contact: null },
      { name: "Popcap", url: "https://www.ea.com/ea-studios/popcap/careers", email: null, contact: null },
      { name: "Race Rocks", url: "https://racerocks3d.ca/careers-and-internships/", email: null, contact: null },
      { name: "Rattleaxe Games", url: "https://rattleaxegames.ca/jobs", email: null, contact: null },
      { name: "Relic", url: "https://www.relic.com/#careers", email: null, contact: null },
      { name: "Respawn Entertainment", url: "https://www.respawn.com/careers", email: null, contact: null },
      { name: "Ripple Effect", url: "https://www.ea.com/ea-studios/ripple-effect/careers", email: null, contact: null },
      { name: "Simply Sweet Games", url: "https://simplysweetgames.ca/careers.html", email: null, contact: null },
      { name: "Skybox Labs", url: "https://skyboxlabs.com/jobs/", email: null, contact: null },
      { name: "Smoking Gun Interactive", url: "https://smokingguninc.com/careers/", email: null, contact: null },
      { name: "Stillfront", url: "https://www.stillfront.com/en/career/join-the-team/", email: null, contact: null },
      { name: "Superbrothers", url: "https://superbrothershq.com/jobs", email: null, contact: null },
      { name: "Supernatural Studios", url: "https://supernaturalstudios.com/#opportunities", email: null, contact: null },
      { name: "Take 2 Interactive", url: "https://careers.take2games.com/", email: null, contact: null },
      { name: "Tavernlight Games", url: "https://tavernlightgames.com/careers", email: null, contact: null },
      { name: "The Coalition Studio", url: "https://www.thecoalitionstudio.com/careers/", email: null, contact: null },
      { name: "This Game Studio", url: "https://www.thisgamestudio.com/#jobs", email: null, contact: null },
      { name: "Thunderous Games", url: "https://www.thunderousgames.com/careers/", email: null, contact: null },
      { name: "Tiny Mob Games", url: "https://www.tinymobgames.com/", email: null, contact: null },
      { name: "Trepang", url: "https://everplaygroup.careers.hibob.com/", email: null, contact: null },
      { name: "Tuatara Games", url: "https://tuataragames.com/careers", email: null, contact: null },
      { name: "Visual Concepts", url: "https://vcentertainment.com/careers/", email: null, contact: null },
    ],
    "Manitoba": [
      { name: "Complex Games", url: "https://www.frontier.co.uk/careers/complex", email: null, contact: null },
      { name: "Project Whitecard", url: "https://go.projectwhitecard.com/careers/", email: null, contact: null },
      { name: "Tactics Interactive", url: "https://tactica.ca/careers/?doing_wp_cron=1780251374.8161730766296386718750", email: null, contact: null },
      { name: "Ubisoft Winnipeg", url: "https://winnipeg.ubisoft.com/career/", email: null, contact: null },
      { name: "Zenfri", url: "https://zenfri.ca/careers/", email: null, contact: null },
    ],
    "New Brunswick": [
      { name: "Gogii Games", url: "https://www.gogiigames.com/careers", email: null, contact: null },
    ],
    "Newfoundland": [
      { name: "Other Ocean Interactive", url: "https://otherocean.com/#jobs", email: null, contact: null },
    ],
    "Nova Scotia": [
      { name: "Bagel and Balloon", url: "https://bagelandballoon.org/work-with-us/", email: null, contact: null },
      { name: "Bitten Toast Games", url: "https://www.bittentoast.com/careers.html", email: null, contact: null },
      { name: "HB Studios", url: "https://job-boards.greenhouse.io/hbstudios", email: null, contact: null },
      { name: "Hutch", url: "https://www.hutch.io/careers/", email: null, contact: null },
      { name: "Red Diamond Interactive", url: "https://www.reddiamondinteractive.com/careers", email: null, contact: null },
    ],
    "Ontario": [
      { name: "2k Play", url: "https://2k.com/", email: null, contact: null },
      { name: "Alpha Channel Games", url: "https://jobs.alphachannelgames.com/", email: null, contact: null },
      { name: "Apocalypse Studios", url: "https://apocalypse333.com/team/", email: null, contact: null },
      { name: "***Autonomicity Games", url: "https://www.acitygames.com/careers", email: null, contact: null },
      { name: "Big Blue Bubble", url: "https://www.bigbluebubble.com/home/careers/career-opportunities/", email: null, contact: null },
      { name: "Big Viking Games", url: "https://apply.workable.com/big-viking-games-3/", email: null, contact: null },
      { name: "Blue Isle Studios", url: "https://www.blueislestudios.ca/jobs", email: null, contact: null },
      { name: "Certain Affinity", url: "https://www.certainaffinity.com/careers/", email: null, contact: null },
      { name: "Clipwire Games", url: "https://www.tripledot.com/careers", email: null, contact: null },
      { name: "Dark Slope", url: "https://www.darkslope.com/careers", email: null, contact: null },
      { name: "Digital Extremes", url: "https://www.digitalextremes.com/careers/list", email: null, contact: null },
      { name: "Doom Turtle", url: "https://doomturtle.ca/careers/", email: null, contact: null },
      { name: "Down Smash Studios", url: "https://www.downsmashstudios.com/#/careers", email: null, contact: null },
      { name: "EA", url: "https://www.ea.com/careers", email: null, contact: null },
      { name: "Finish Line Games", url: "https://finishlinegames.com/careers/", email: null, contact: null },
      { name: "Game Hive", url: "https://gamehive.com/careers/", email: null, contact: null },
      { name: "Game Pill", url: "https://gamepill.com/career/", email: null, contact: null },
      { name: "Gameloft", url: "https://www.gameloft.com/careers", email: null, contact: null },
      { name: "Games by Stitch", url: "https://www.stitch.media/careers", email: null, contact: null },
      { name: "Golden Ventures", url: "https://jobs.golden.ventures/", email: null, contact: null },
      { name: "Heavy Pepper", url: "https://www.heavypepper.com/careers", email: null, contact: null },
      { name: "Jam City", url: "https://www.jamcity.com/life-at-jam-city/", email: null, contact: null },
      { name: "Joydrop", url: "https://www.joydrop.co/#Hiring", email: null, contact: null },
      { name: "Komi Games", url: "https://www.komigames.com/careers", email: null, contact: null },
      { name: "Lightning Rod Games", url: "https://lightningrodgames.com/careers/", email: null, contact: null },
      { name: "Lucky Logic", url: "https://lucky-logic.breezy.hr/", email: null, contact: null },
      { name: "Massive Damage", url: "https://massivedamagestudios.com/jobs/", email: null, contact: null },
      { name: "Maxis", url: "https://www.ea.com/ea-studios/maxis/careers", email: null, contact: null },
      { name: "Picnic Game Labs", url: "https://picnicgamelabs.com/jobs/", email: null, contact: null },
      { name: "Pong Studio", url: "https://www.pongstudios.com/careers", email: null, contact: null },
      { name: "Puzzle Cats", url: "https://puzzle-cats.breezy.hr/", email: null, contact: null },
      { name: "Raikiri Games", url: "https://www.raikirigames.com/jobs", email: null, contact: null },
      { name: "Riyo Games", url: "https://riyogames.com/careers", email: null, contact: null },
      { name: "Rockstar Toronto", url: "https://www.rockstargames.com/careers", email: null, contact: null },
      { name: "Rovio", url: "https://www.rovio.com/careers/", email: null, contact: null },
      { name: "Siege Camp", url: "https://www.siegecamp.com/careers", email: null, contact: null },
      { name: "Sinn Studio", url: "https://www.sinnstudio.com/careers#positions", email: null, contact: null },
      { name: "Sledgehammer Games", url: "https://careers.sledgehammergames.com/", email: null, contact: null },
      { name: "Smilegate West", url: "https://www.smilegatewest.com/", email: null, contact: null },
      { name: "Snowed In Studios", url: "https://snowedin.ca/recruiting/", email: null, contact: null },
      { name: "Snowman", url: "https://www.builtbysnowman.com/jobs/", email: null, contact: null },
      { name: "Soft Rains", url: "https://softrains.games/#hiring", email: null, contact: null },
      { name: "Softgames", url: "https://www.softgames.com/gaming-jobs-in-berlin/", email: null, contact: null },
      { name: "Stitch Media", url: "https://www.stitch.media/careers", email: null, contact: null },
      { name: "Studio MDHR", url: "https://studiomdhr.com/careers/", email: null, contact: null },
      { name: "Tactic Studios", url: "https://www.tacticstudios.com/careers.php", email: null, contact: null },
      { name: "Take 2 Interactive", url: "https://careers.take2games.com/", email: null, contact: null },
      { name: "Torn Banner Studios", url: "https://tornbanner.com/careers/", email: null, contact: null },
      { name: "Turbulent", url: "https://turbulent.ca/join-us/", email: null, contact: null },
      { name: "Ubisoft Toronto", url: "https://toronto.ubisoft.com/jobs/", email: null, contact: null },
      { name: "Uken Games", url: "https://uken.com/careers", email: null, contact: null },
      { name: "Wicked Interactive", url: "https://wickedinteractiveltd.com/careers.aspx", email: null, contact: null },
    ],
    "Prince Edward Island": [
      { name: "Other Ocean Interactive", url: "https://otherocean.com/#jobs", email: null, contact: null },
    ],
    "Quebec": [
      { name: "01 Studio", url: "https://01studio.ca/", email: null, contact: null },
      { name: "2k Games", url: "https://2k.com/", email: null, contact: null },
      { name: "Amazon Game Studio Montreal", url: "https://www.amazongamestudios.com/en-us/careers", email: null, contact: null },
      { name: "Amber", url: "https://jobs.jobvite.com/amberstudiocareers/", email: null, contact: null },
      { name: "Artifact 5", url: "https://artifact5.com/#jobs", email: null, contact: null },
      { name: "Avalanche Studio", url: "https://avalanchestudios.com/careers", email: null, contact: null },
      { name: "Beenox", url: "https://beenox.com/carrieres/", email: null, contact: null },
      { name: "Behaviour Interactive", url: "https://www.bhvr.com/jobs/", email: null, contact: null },
      { name: "Bethesda Montreal", url: "https://bethesdagamestudios.com/#careers", email: null, contact: null },
      { name: "BKOM Studios", url: "https://jobs.bkom.com/jobs/Careers", email: null, contact: null },
      { name: "Budge Studios", url: "https://budgestudios.com/en/careers/", email: null, contact: null },
      { name: "Cathar Games", url: "https://www.cathargames.com/en/careers.html", email: null, contact: null },
      { name: "Chasing Rats Games", url: "https://chasingratsgames.com/", email: null, contact: null },
      { name: "Cloud Chamber", url: "https://2k.com/studios/cloud-chamber/", email: null, contact: null },
      { name: "Compulsion Games", url: "https://compulsiongames.com/#careers", email: null, contact: null },
      { name: "Cradle Games", url: "https://www.cradlegames.com/index.php/jobs", email: null, contact: null },
      { name: "Creature Studios", url: "https://www.crea-turestudios.com/en/career/", email: null, contact: null },
      { name: "EA Montreal", url: "https://www.ea.com/careers", email: null, contact: null },
      { name: "Eidos", url: "https://www.eidosmontreal.com/careers/", email: null, contact: null },
      { name: "Epic Games Montreal", url: "https://www.epicgames.com/site/careers/jobs", email: null, contact: null },
      { name: "Ever Curious Games", url: "https://www.evercurious.games/open-positions", email: null, contact: null },
      { name: "***Flameborn Games", url: "https://www.flameborngames.com/jobs", email: null, contact: null },
      { name: "Framestore VR", url: "https://framestorevr.com/careers", email: null, contact: null },
      { name: "Gameloft", url: "https://www.gameloft.com/careers", email: null, contact: null },
      { name: "GAMERella", url: "https://gamerella.ca/jobs/en/", email: null, contact: null },
      { name: "Gearbox Software", url: "https://www.gearboxsoftware.com/careers/", email: null, contact: null },
      { name: "Golem Labs", url: "https://www.golemlabs.com/career.php", email: null, contact: null },
      { name: "Goose Byte", url: "https://goosebyte.games/careers/", email: null, contact: null },
      { name: "Hatchery Games", url: "https://www.hatcherygames.com/#jobs", email: null, contact: null },
      { name: "Haven Studios", url: "https://havenstudios.com/en/careers", email: null, contact: null },
      { name: "Highdive Games", url: "https://highdivegames.com/en/careers", email: null, contact: null },
      { name: "Hololabs", url: "https://hololabs.org/careers/", email: null, contact: null },
      { name: "Illogika", url: "https://www.illogika.com/carrieres", email: null, contact: null },
      { name: "Indie Asylum", url: "https://www.indieasylum.com/emplois", email: null, contact: null },
      { name: "Invoke Studios", url: "https://invokestudios.com/careers/", email: null, contact: null },
      { name: "Krafton", url: "https://kraftonmontreal.com/", email: null, contact: null },
      { name: "Larian Studios", url: "https://larian.com/careers", email: null, contact: null },
      { name: "Ludia", url: "https://www.ludia.com/", email: null, contact: null },
      { name: "Meta4", url: "https://www.meta4.games/careers/", email: null, contact: null },
      { name: "Mino Games", url: "https://www.minogames.com/careers", email: null, contact: null },
      { name: "Motive", url: "https://www.ea.com/ea-studios/motive/careers", email: null, contact: null },
      { name: "NetEase Games", url: "https://www.neteasegames.com/", email: null, contact: null },
      { name: "Nine Dots Studio", url: "https://www.ninedotsstudio.com/careers", email: null, contact: null },
      { name: "Normcore", url: "https://normcore.io/careers", email: null, contact: null },
      { name: "Norsfell", url: "https://norsfell.com/en/careers/", email: null, contact: null },
      { name: "Outerminds", url: "https://outerminds.com/job-offers/", email: null, contact: null },
      { name: "Panache Digital Games", url: "https://panachedigitalgames.com/carrieres/", email: null, contact: null },
      { name: "People Can Fly", url: "https://careers.smartrecruiters.com/PeopleCanFly", email: null, contact: null },
      { name: "***Polymorph Games", url: "https://www.polymorph.games/foundation/news/fr/emplois/", email: null, contact: null },
      { name: "Product Madness", url: "https://www.productmadness.com/careers/", email: null, contact: null },
      { name: "Quantic Dream", url: "https://www.quanticdream.com/en/careers", email: null, contact: null },
      { name: "RageCure Games", url: "https://www.ragecure.games/careers", email: null, contact: null },
      { name: "Red Barrels", url: "https://redbarrelsgames.com/careers/", email: null, contact: null },
      { name: "Reflector Entertainment", url: "https://jobs.dayforcehcm.com/fr-CA/ref/CANDIDATEPORTAL", email: null, contact: null },
      { name: "Rogue Factor", url: "https://rogue-factor.com/careers/", email: null, contact: null },
      { name: "Rovio", url: "https://www.rovio.com/careers/", email: null, contact: null },
      { name: "Sarbakan Studio", url: "https://sarbakanstudio.com/en/carreer/", email: null, contact: null },
      { name: "Scavengers Studio", url: "https://www.scavengers.ca/careers", email: null, contact: null },
      { name: "Solition Interactive", url: "https://solitoninteractive.com/career/", email: null, contact: null },
      { name: "Spearhead Games", url: "https://www.spearheadgames.ca/two", email: null, contact: null },
      { name: "Square Enix", url: "https://www.square-enix-games.com/en_US/careers", email: null, contact: null },
      { name: "Squido Studio", url: "https://www.squidostudio.com/jobs", email: null, contact: null },
      { name: "Tara Gaming", url: "https://taragaming.com/join-us", email: null, contact: null },
      { name: "Threeclipse", url: "https://threeclipse.com/junior-program/", email: null, contact: null },
      { name: "Thunder Lotus", url: "https://thunderlotusgames.com/jobs/", email: null, contact: null },
      { name: "Trebuchet", url: "https://trebuchet.fun/en/studio#jobs", email: null, contact: null },
      { name: "Tribute Games", url: "https://tributegames.com/#jobs", email: null, contact: null },
      { name: "Trio Tech", url: "https://www.trio-tech.com/career/", email: null, contact: null },
      { name: "Triple Boris", url: "https://www.tripleboris.com/en/career/", email: null, contact: null },
      { name: "Turbulent", url: "https://turbulent.ca/join-us/", email: null, contact: null },
      { name: "Umanaia", url: "https://www.umanaia.com/", email: null, contact: null },
      { name: "Voodoo", url: "https://voodoo.io/careers", email: null, contact: null },
      { name: "Warner Bros", url: "https://wbgamesmontreal.com/careers/", email: null, contact: null },
      { name: "Wizards of the Coast", url: "https://company.wizards.com/en/careers", email: null, contact: null },
      { name: "Yellow Brick Games", url: "https://yellowbrickgames.ca/jobs/", email: null, contact: null },
    ],
    "Saskatchewan": [
      { name: "Noodlecake Studios", url: "https://noodlecake.com/careers/", email: null, contact: null },
      { name: "Studio MDHR", url: "https://studiomdhr.com/careers/", email: null, contact: null },
    ],
  },
};

const VOLUNTEER_OVERRIDES = {
  "Wolfpack Game Design": { isVolunteer:true, jobs:[
    { title:"3D Character Animator", summary:"Rig and animate the diverse hybrid characters of World Soul, a post-apocalyptic narrative RPG in Unreal Engine 5. Volunteer — excellent for portfolio.", experience:"Entry Level", type:"Volunteer", salary:"Volunteer (unpaid)", isRemote:true, responsibilities:["Rig and animate humanoid and creature characters in UE5","Create locomotion, combat, and cinematic animations","Implement UE5 animation blueprints and state machines","Collaborate with character artists on visual direction"], requirements:["Portfolio demonstrating character animation in UE5 or similar","Experience rigging humanoid characters","Passion for narrative RPG games","Ability to work remotely and asynchronously"] },
    { title:"Art Producer", summary:"Coordinate cross-functional art teams for World Soul, driving milestone deliverables and liaising between creative and technical departments. Volunteer.", experience:"Mid Level", type:"Volunteer", salary:"Volunteer (unpaid)", isRemote:true, responsibilities:["Drive scheduling and production planning for art teams","Track asset pipelines across 2D, 3D, VFX, and animation","Maintain documentation and update Jira/ShotGrid","Communicate production goals clearly to team members"], requirements:["2+ years in art development or digital content production","Strong understanding of art workflows and pipelines","Experience with Jira, ShotGrid, or similar tools","Passion for indie game development"] },
    { title:"3D Character Artist", summary:"Model, sculpt, and texture high-quality character assets for World Soul, a post-apocalyptic RPG in UE5. Volunteer — great for building your portfolio.", experience:"Mid Level", type:"Volunteer", salary:"Volunteer (unpaid)", isRemote:true, responsibilities:["Model and sculpt character assets aligned with the visual direction","Create PBR textures in Substance Painter","Collaborate with the art director for visual consistency","Optimize assets for real-time UE5 performance"], requirements:["Strong portfolio of game-ready character art","Proficiency in ZBrush, Maya, or Blender","Experience with Substance Painter for PBR texturing","Interest in narrative RPG games"] },
    { title:"Environment Artist", summary:"Create immersive optimized environments for the post-apocalyptic world of World Soul in Unreal Engine 5. Volunteer position.", experience:"Mid Level", type:"Volunteer", salary:"Volunteer (unpaid)", isRemote:true, responsibilities:["Build modular environment kits and hero assets in UE5","Create tileable textures and materials in Substance","Work with art director on visual quality","Optimize assets for real-time performance"], requirements:["Portfolio showing game-ready environment art","Proficiency with UE5 or similar real-time engine","Experience with modular asset workflows","Knowledge of PBR texturing pipelines"] },
    { title:"UI/UX Designer", summary:"Design and implement intuitive thematic UI for World Soul — menus, HUDs, and inventory systems native to the post-apocalyptic game world. Volunteer.", experience:"Entry Level", type:"Volunteer", salary:"Volunteer (unpaid)", isRemote:true, responsibilities:["Design UI including HUDs, menus, and inventory screens","Create wireframes and prototypes for key game systems","Collaborate with programmers to implement UI in UE5","Maintain accessibility and visual consistency"], requirements:["Portfolio demonstrating game UI or UX work","Familiarity with UE5 UMG or similar UI frameworks","Strong visual design sense","Experience with Figma a plus"] },
  ]}
};

// ── EMAIL-APPLY JOBS ──────────────────────────────────────────────────────────
// Companies where the ONLY way to apply is by email. Each posting routes to a
// specific email address. These render as real cards with an "Apply by Email" button.
const EMAIL_APPLY_JOBS = {
  "Break Away Games": { jobs:[
    { title:"Programmer", applyEmail:"resumes0919a@breakawayltd.com", experience:"Mid Level", type:"Full-time", isRemote:false, summary:"Send your programmer resume to apply. Please include \u2018BreakAway Online Job Posting\u2019 in the subject line of your email.", responsibilities:[], requirements:[] },
    { title:"Artist", applyEmail:"resumes0919b@breakawayltd.com", experience:"Mid Level", type:"Full-time", isRemote:false, summary:"Send your artist resume to apply. Please include \u2018BreakAway Online Job Posting\u2019 in the subject line of your email.", responsibilities:[], requirements:[] },
    { title:"Audio/Video", applyEmail:"resumes0919e@breakawayltd.com", experience:"Mid Level", type:"Full-time", isRemote:false, summary:"Send your audio/video resume to apply. Please include \u2018BreakAway Online Job Posting\u2019 in the subject line of your email.", responsibilities:[], requirements:[] },
    { title:"Marketing / Business Development", applyEmail:"resumes0919f@breakawayltd.com", experience:"Mid Level", type:"Full-time", isRemote:false, summary:"Send your marketing/biz-dev resume to apply. Please include \u2018BreakAway Online Job Posting\u2019 in the subject line of your email.", responsibilities:[], requirements:[] },
    { title:"Game Tester", applyEmail:"resumes0919g@breakawayltd.com", experience:"Entry Level", type:"Full-time", isRemote:false, summary:"Send your game tester resume to apply. Please include \u2018BreakAway Online Job Posting\u2019 in the subject line of your email.", responsibilities:[], requirements:[] },
  ]},
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
  const mkDate=(i)=>{const d=new Date(Date.now()-(i*7+2)*86400000);return{posted:d,postedStr:d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),daysAgo:i*7+2};};
  // 1. Volunteer-override jobs (e.g. WolfPack) — real curated volunteer roles
  const ov = VOLUNTEER_OVERRIDES[company.name];
  if (ov) return ov.jobs.map((j,i)=>{const dt=mkDate(i);return{ id:`${company.name}-ov-${i}`, title:j.title, company:company.name, url:company.url, applyUrl:company.url, state:stateKey, ...dt, isNew:i===0, isRemote:j.isRemote, type:j.type, salary:j.salary, email:company.email, experience:j.experience, isVolunteer:true, summary:j.summary, responsibilities:j.responsibilities||[], requirements:j.requirements||[] };});
  // 2. Email-apply jobs (e.g. BreakAway) — each posting routes to a specific email
  const ea = EMAIL_APPLY_JOBS[company.name];
  if (ea) return ea.jobs.map((j,i)=>{const dt=mkDate(i);return{ id:`${company.name}-ea-${i}`, title:j.title, company:company.name, url:company.url, applyUrl:company.url, state:stateKey, ...dt, isNew:false, isRemote:j.isRemote, type:j.type, salary:j.salary||"", email:j.applyEmail, applyEmail:j.applyEmail, experience:j.experience, isVolunteer:!!company.volunteer, isEmailApply:true, summary:j.summary, responsibilities:j.responsibilities||[], requirements:j.requirements||[] };});
  return []; // no fake jobs — companies show via ATS live data or contact buttons only
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

// ── UNIVERSAL ATS SYSTEM ──────────────────────────────────────────────────────
// Studios linked to their hiring platform (ATS). Each entry tells the app which
// public API to call. All 6 platforms below have free public JSON endpoints —
// no API key, no auth. Add studios here as you verify them (see the verify tool).
//
// Format:  "Studio Name": { platform: "greenhouse", slug: "theirslug" }
// Platforms: greenhouse | lever | ashby | workable | smartrecruiters | recruitee
//
// HOW TO FIND A SLUG: open the studio's careers page, look at the URL. Examples:
//   boards.greenhouse.io/SLUG       → greenhouse, slug is the last path part
//   jobs.lever.co/SLUG              → lever
//   jobs.ashbyhq.com/SLUG           → ashby
//   apply.workable.com/SLUG         → workable
//   careers.smartrecruiters.com/SLUG→ smartrecruiters
//   SLUG.recruitee.com              → recruitee
// Then verify it at /verify in your app before adding it here.
const ATS_STUDIOS = {
  // ─── Ashby studios (includes salary data) ───
  "Battle Creek Games":       { platform:"ashby", slug:"battle-creek-games" },
  "Playgig":                  { platform:"ashby", slug:"playgig" },
  "Second Dinner":            { platform:"ashby", slug:"seconddinner" },
  // ─── ApplytoJob ───
  "Hi-Rez Studios":           { platform:"applytojob", slug:"hirezstudios" },
  "Lost Boys Interactive":    { platform:"applytojob", slug:"lostboysinteractive" },
  "Templar Media":            { platform:"applytojob", slug:"templar" },
  // ─── BambooHR ───
  "Gasket Games":             { platform:"bamboohr", slug:"gasketgames" },
  "Motorsport Games":         { platform:"bamboohr", slug:"motorsportgames" },
  // ─── Greenhouse studios ───
  "Bungie":                   { platform:"greenhouse", slug:"bungie" },
  "Cat Daddy Games":          { platform:"greenhouse", slug:"catdaddy" },
  "Digital Extremes":         { platform:"greenhouse", slug:"digitalextremes" },
  "Discord":                  { platform:"greenhouse", slug:"discord" },
  "Epic Games":               { platform:"greenhouse", slug:"epicgames" },
  "HB Studios":               { platform:"greenhouse", slug:"hbstudios" },
  "Insomniac Games":          { platform:"greenhouse", slug:"insomniac" },
  "Nightdive Studios":        { platform:"greenhouse", slug:"nightdivestudios" },
  "Riot Games":               { platform:"greenhouse", slug:"riotgames" },
  "Roblox":                   { platform:"greenhouse", slug:"roblox" },
  "Scopely":                  { platform:"greenhouse", slug:"scopely" },
  "Singularity 6":            { platform:"greenhouse", slug:"singularity6" },
  "The Pokemon Company":      { platform:"greenhouse", slug:"pokemoncareers" },
  "Tripwire Interactive":     { platform:"greenhouse", slug:"tripwireinteractive" },
  "Undead Labs":              { platform:"greenhouse", slug:"undeadlabsllc" },
  "Zynga":                    { platform:"greenhouse", slug:"zynga" },
  // ─── Jobvite ───
  "AGS":                      { platform:"jobvite", slug:"agscareer" },
  "Probably Monsters":        { platform:"jobvite", slug:"probablymonsters" },
  // ─── Lever studios ───
  "Behaviour Interactive":    { platform:"lever", slug:"bhvr" },
  "Double Down Interactive":  { platform:"lever", slug:"doubledown" },
  "Skydance":                 { platform:"lever", slug:"skydance" },
  // ─── Paylocity ───
  "Design Works Gaming":      { platform:"paylocity", slug:"design-works-gaming" },
  // ─── Smart Recruiters ───
  "People Can Fly":           { platform:"smartrecruiters", slug:"peoplecanfly" },
  // ─── Workable ───
  "Big Viking Games":         { platform:"workable", slug:"big-viking-games-3" },
  "Crazy Maple Studio":       { platform:"workable", slug:"crazymaplestudio" },
  "Game Sim":                 { platform:"workable", slug:"gamesim-2" },
  "Hardsuit Labs":            { platform:"workable", slug:"hardsuit-labs-1" },
  "Jackbox Games":            { platform:"workable", slug:"jackbox-games" },
  "KingsIsle Entertainment":  { platform:"workable", slug:"kingsisle-entertainment-inc" },
  "Mad Mushroom":             { platform:"workable", slug:"otk-media" },
  "Nexus Studios":            { platform:"workable", slug:"nexusstudios" },
  "Secret 6":                 { platform:"workable", slug:"secret-6" },
  "Sperasoft":                { platform:"workable", slug:"sperasoft" },
  "Velan Studios":            { platform:"workable", slug:"velanstudios" },
  // ═══════════ INTERNATIONAL (verify all at /verify) ═══════════
  // ─── International: Greenhouse studios ───
  "Avalanche Studios":           { platform:"greenhouse", slug:"avalanchestudios" },
  "Cloud Imperium Games":        { platform:"greenhouse", slug:"cloudimperiumgames" },
  "Crytek":                      { platform:"greenhouse", slug:"crytek" },
  "Etermax":                     { platform:"greenhouse", slug:"etermax" },
  "InnoGames":                   { platform:"greenhouse", slug:"innogames" },
  "Jagex":                       { platform:"greenhouse", slug:"jagex" },
  "Mediatonic":                  { platform:"greenhouse", slug:"mediatonicgames" },
  "Social Point":                { platform:"greenhouse", slug:"socialpoint" },
  "Splash Damage":               { platform:"greenhouse", slug:"splashdamage" },
  "Supercell":                   { platform:"greenhouse", slug:"supercell" },
  "Unity Technologies":          { platform:"greenhouse", slug:"unity3d" },
  "Wildlife Studios":            { platform:"greenhouse", slug:"wildlifestudios" },
  "Wooga":                       { platform:"greenhouse", slug:"wooga" },
  "nDreams":                     { platform:"greenhouse", slug:"ndreams" },
  // ─── International: Lever studios ───
  "Klang Games":                 { platform:"lever", slug:"klang" },
  // ─── International: Smart Recruiters ───
  "IO Interactive":              { platform:"smartrecruiters", slug:"iointeractive" },
  "Remedy Entertainment":        { platform:"smartrecruiters", slug:"remedyentertainment" },
  "Rovio":                       { platform:"smartrecruiters", slug:"rovio" },
  "Ubisoft Paris":               { platform:"smartrecruiters", slug:"ubisoft" },
  // NOTE: The slugs above are best guesses. VERIFY each at /verify before trusting.
};

// Normalize a job from ANY ATS platform into our internal shape
function normalizeATSJob(raw, platform, company, stateKey) {
  const decodeEntities = h => (h||"")
    .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#x27;/g,"'").replace(/&apos;/g,"'")
    .replace(/&amp;/g,"&").replace(/&nbsp;/g," ").replace(/&mdash;/g,"\u2014").replace(/&ndash;/g,"\u2013").replace(/&rsquo;/g,"\u2019").replace(/&lsquo;/g,"\u2018").replace(/&ldquo;/g,"\u201c").replace(/&rdquo;/g,"\u201d").replace(/&hellip;/g,"\u2026").replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(+n));
  const stripHtml = h => decodeEntities(h||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  const guessExp = t => { const tl=(t||"").toLowerCase(); if(/director|head of|vp/.test(tl))return"Director"; if(/principal/.test(tl))return"Principal"; if(/\blead\b/.test(tl))return"Lead"; if(/senior|sr\./.test(tl))return"Senior"; if(/junior|jr\.|intern|entry/.test(tl))return"Entry Level"; return"Mid Level"; };
  let title="", url="", body="", loc="", updated=Date.now(), salary="Salary not listed", rawHtml="";

  if(platform==="greenhouse"){
    title=raw.title||""; url=raw.absolute_url||company.url; rawHtml=raw.content||""; body=stripHtml(rawHtml);
    loc=raw.location?.name||""; updated=new Date(raw.updated_at||raw.first_published_at||Date.now()).getTime();
  } else if(platform==="lever"){
    title=raw.text||""; url=raw.hostedUrl||raw.applyUrl||company.url; rawHtml=raw.description||raw.descriptionPlain||""; body=stripHtml(raw.descriptionPlain||raw.description||"");
    loc=raw.categories?.location||""; updated=raw.createdAt||Date.now();
  } else if(platform==="ashby"){
    title=raw.title||""; url=raw.jobUrl||raw.applyUrl||company.url; rawHtml=raw.descriptionHtml||raw.description||""; body=stripHtml(rawHtml);
    loc=raw.locationName||raw.location||""; updated=new Date(raw.publishedAt||Date.now()).getTime();
    if(raw.compensation?.compensationTierSummary) salary=raw.compensation.compensationTierSummary;
  } else if(platform==="workable"){
    title=raw.title||""; url=raw.url||raw.application_url||company.url; rawHtml=raw.description||""; body=stripHtml(rawHtml);
    loc=raw.location?.location_str||raw.city||""; updated=new Date(raw.published_on||Date.now()).getTime();
  } else if(platform==="smartrecruiters"){
    title=raw.name||""; url=(raw.ref&&`https://jobs.smartrecruiters.com/${raw.ref}`)||raw.applyUrl||company.url; rawHtml=raw.jobAd?.sections?.jobDescription?.text||""; body=stripHtml(rawHtml);
    loc=[raw.location?.city,raw.location?.region].filter(Boolean).join(", "); updated=new Date(raw.releasedDate||Date.now()).getTime();
  } else if(platform==="recruitee"){
    title=raw.title||""; url=raw.careers_url||raw.url||company.url; rawHtml=raw.description||""; body=stripHtml(rawHtml);
    loc=raw.location||raw.city||""; updated=new Date(raw.published_at||Date.now()).getTime();
  } else if(platform==="applytojob"){
    title=raw.title||raw.name||""; url=raw.board_url||raw.apply_url||company.url; rawHtml=raw.description||""; body=stripHtml(rawHtml);
    loc=[raw.city,raw.state].filter(Boolean).join(", ")||raw.location||""; updated=new Date(raw.original_open_date||raw.created_at||Date.now()).getTime();
    if(raw.minimum_salary&&raw.maximum_salary) salary=`$${raw.minimum_salary} \u2013 $${raw.maximum_salary}`;
  } else if(platform==="bamboohr"){
    title=raw.jobOpeningName||raw.title||""; url=(raw.id&&`https://${company.slug||""}.bamboohr.com/careers/${raw.id}`)||company.url; rawHtml=raw.description||""; body=stripHtml(rawHtml);
    loc=raw.location?(typeof raw.location==="string"?raw.location:[raw.location.city,raw.location.state].filter(Boolean).join(", ")):""; updated=new Date(raw.datePosted||Date.now()).getTime();
  } else if(platform==="paylocity"){
    title=raw.title||raw.jobTitle||raw.name||""; url=raw.url||raw.applyUrl||company.url; rawHtml=raw.description||raw.jobDescription||""; body=stripHtml(rawHtml);
    loc=[raw.city,raw.state].filter(Boolean).join(", ")||raw.location||""; updated=new Date(raw.postedDate||raw.datePosted||Date.now()).getTime();
  } else if(platform==="jobvite"){
    title=raw.title||raw.jobTitle||""; url=raw.detailUrl||raw.applyUrl||raw.url||company.url; rawHtml=raw.description||raw.jobDescription||""; body=stripHtml(rawHtml);
    loc=raw.location||[raw.city,raw.state].filter(Boolean).join(", ")||""; updated=new Date(raw.date||raw.postedDate||Date.now()).getTime();
  }

  const daysAgo=Math.floor((Date.now()-updated)/86400000);
  const isRemote=/remote|distributed|anywhere/i.test(title+" "+loc+" "+body.slice(0,200));
  // try to find a salary range in the body if not provided
  if(salary==="Salary not listed"){
    const sm=body.match(/\$(\d[\d,]+)\s*[-\u2013]+\s*\$(\d[\d,]+)/);
    if(sm) salary=`$${parseInt(sm[1].replace(/,/g,"")).toLocaleString()} \u2013 $${parseInt(sm[2].replace(/,/g,"")).toLocaleString()}`;
  }
  const parsed=parseJobSections(rawHtml,body);
  return {
    id:`ats-${platform}-${raw.id||raw.shortcode||raw.uuid||title.replace(/\s+/g,"")}`,
    title, company:company.name, url, applyUrl:url, state:stateKey,
    posted:new Date(updated), postedStr:new Date(updated).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
    daysAgo, isNew:daysAgo<3, isRemote, type:"Full-time", salary, email:company.email,
    experience:guessExp(title), isVolunteer:false, isLive:true,
    summary:(parsed.summary||body.slice(0,240)).trim()+((parsed.summary||body).length>240?"\u2026":""),
    fullDescription:body.slice(0,2000),
    responsibilities:parsed.responsibilities, requirements:parsed.requirements, location:loc,
  };
}

// Parse a job's HTML/text into a summary + responsibilities + requirements lists.
function parseJobSections(html,plainText){
  const out={summary:"",responsibilities:[],requirements:[]};
  if(!html&&!plainText)return out;
  // Decode HTML entities first (some ATS double-encode their HTML)
  if(html)html=html.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#x27;/g,"'").replace(/&apos;/g,"'").replace(/&amp;/g,"&").replace(/&nbsp;/g," ").replace(/&mdash;/g,"\u2014").replace(/&ndash;/g,"\u2013").replace(/&rsquo;/g,"\u2019").replace(/&hellip;/g,"\u2026").replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(+n));
  // Pull <li> items grouped by the nearest preceding heading
  const liItems=[];
  if(html){
    // Split on headings to find section context
    const sections=html.split(/<(?:h[1-6]|strong|b)[^>]*>/i);
    for(const sec of sections){
      const headMatch=sec.slice(0,80).replace(/<[^>]+>/g," ").toLowerCase();
      const lis=[...sec.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m=>m[1].replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()).filter(t=>t.length>3&&t.length<300);
      if(lis.length){
        const isReq=/require|qualif|you have|you'll need|skills|experience|must have|looking for/i.test(headMatch);
        const isResp=/responsib|what you|you will|role|duties|day.to.day|about the/i.test(headMatch);
        for(const li of lis){
          if(isReq)out.requirements.push(li);
          else if(isResp)out.responsibilities.push(li);
          else liItems.push(li);
        }
      }
    }
  }
  // If nothing was categorized but we have loose <li>, use keyword heuristics
  if(out.responsibilities.length===0&&out.requirements.length===0&&liItems.length===0&&html){
    const allLis=[...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m=>m[1].replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()).filter(t=>t.length>3&&t.length<300);
    allLis.forEach(li=>{
      if(/\b(year|experience|degree|proficien|knowledge of|familiar|expert|strong|ability to|bachelor|skill)\b/i.test(li))out.requirements.push(li);
      else out.responsibilities.push(li);
    });
  } else {
    // distribute uncategorized list items into responsibilities by default
    liItems.forEach(li=>out.responsibilities.push(li));
  }
  // Cap list lengths
  out.responsibilities=out.responsibilities.slice(0,8);
  out.requirements=out.requirements.slice(0,8);
  // Summary = first meaningful paragraph of plain text
  if(plainText){
    const firstPara=plainText.split(/(?<=[.!?])\s+/).slice(0,3).join(" ");
    out.summary=firstPara.slice(0,240);
  }
  return out;
}

const EMAIL_PROVIDERS = {
  gmail:(to,s,b)=>`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`,
  outlook:(to,s,b)=>`https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`,
  yahoo:(to,s,b)=>`https://compose.mail.yahoo.com/?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`,
  proton:()=>`https://mail.proton.me/u/0/inbox#compose`,
};
// ── LEGAL VERSION ─────────────────────────────────────────────────────────────
// Bump this date whenever Terms or Privacy Policy change. Users who agreed to an
// older version will be prompted to re-accept via a popup near the footer.
const TOS_VERSION = "2026-06-20";

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
  Bell:({s=16,c="currentColor",fill="none"})=><svg width={s} height={s} viewBox="0 0 16 16" fill={fill} stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5A4.5 4.5 0 0 0 3.5 6v3L2 11h12l-1.5-2V6A4.5 4.5 0 0 0 8 1.5z"/><path d="M6.5 11v.5a1.5 1.5 0 0 0 3 0V11"/></svg>,
  Alert:({s=18})=><svg width={s} height={s} viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="#c0321a"/><line x1="9" y1="5" x2="9" y2="10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="13" r="1" fill="white"/></svg>,
};

// ── AUTH ─────────────────────────────────────────────────────────────────────
function Auth({onLogin}) {
  const mobile = useIsMobile();
  const [mode,setMode]=useState("login");
  const [agreed,setAgreed]=useState(false);
  const [staySignedIn,setStaySignedIn]=useState(true);
  const [name,setName]=useState(""),  [email,setEmail]=useState(""), [pass,setPass]=useState("");
  const [err,setErr]=useState(""), [loading,setLoading]=useState(false), [show,setShow]=useState(false);
  const submit = async () => {
    setErr("");
    if (!email || !pass) { setErr("Fill in all fields."); return; }
    if (mode === "signup" && !name) { setErr("Enter your name."); return; }
    if (mode === "signup" && !agreed) { setErr("Please agree to the Terms of Service and Privacy Policy."); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password: pass });
        if (error) { setErr(error.message); setLoading(false); return; }
        await supabase.from("profiles").insert({ id: data.user.id, name, data: { tosVersion: TOS_VERSION } });
        onLogin({ id: data.user.id, email, name, applied: {}, profile: { tosVersion: TOS_VERSION } });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) { setErr("Invalid email or password."); setLoading(false); return; }
        try{ if(staySignedIn){localStorage.setItem("mq_stay","1");}else{localStorage.removeItem("mq_stay");sessionStorage.setItem("mq_session","1");} }catch{}
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
        const { data: apps } = await supabase.from("applications").select("*").eq("user_id", data.user.id);
        const applied = {};
        (apps || []).forEach(a => { applied[a.job_id] = { date: a.applied_at }; });
        const profData = (profile && profile.data) ? profile.data : (profile || {});
        onLogin({ id: data.user.id, email, name: profile?.name || profData.name || email, applied, profile: profData });
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
    <style>{`.ai{color:#f4edd8}select{color-scheme:dark!important;background-color:#140e0a!important;background:#140e0a!important;color:#f4edd8!important;-webkit-appearance:none;-moz-appearance:none;appearance:none;background-image:url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23c9a84c%22%20d%3D%22M2%204l4%204%204-4z%22%2F%3E%3C%2Fsvg%3E")!important;background-repeat:no-repeat!important;background-position:right 10px center!important;padding-right:28px!important;cursor:pointer}select option{background-color:#140e0a!important;background:#140e0a!important;color:#f4edd8!important}select optgroup{background-color:#140e0a!important;color:#f4edd8!important}select option:hover,select option:checked,select option:focus,select option:active{background-color:#2a1d12!important;background:#2a1d12!important;color:#f0d080!important;box-shadow:0 0 10px 100px #2a1d12 inset!important}select:focus{outline:none;border-color:rgba(201,168,76,.5)!important}.ai-in{animation:ain .6s both}@keyframes ain{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes ob1{0%,100%{transform:translate(0,0)}50%{transform:translate(50px,-30px)}}@keyframes ob2{0%,100%{transform:translate(0,0)}50%{transform:translate(-60px,30px)}}input.mq-in{width:100%;background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.22);color:#f4edd8;border-radius:10px;padding:10px 12px 10px 38px;font-size:14px;font-family:'Space Grotesk',sans-serif;box-sizing:border-box;transition:all .2s}input.mq-in:focus{outline:none;border-color:#c9a84c;background:rgba(201,168,76,.1);box-shadow:0 0 0 3px rgba(201,168,76,.15)}input.mq-in::placeholder{color:rgba(244,237,216,.3)}`}</style>
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
          {mode==="signup"&&<label style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:11,color:"rgba(244,237,216,.55)",lineHeight:1.5,cursor:"pointer"}}>
            <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{marginTop:2,accentColor:"#c9a84c",cursor:"pointer",flexShrink:0}}/>
            <span>I agree to the <a href="/terms" target="_blank" style={{color:"#c9a84c"}}>Terms of Service</a> and <a href="/privacy" target="_blank" style={{color:"#c9a84c"}}>Privacy Policy</a>.</span>
          </label>}
          {mode==="login"&&<label style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"rgba(244,237,216,.6)",cursor:"pointer",userSelect:"none"}}>
            <input type="checkbox" checked={staySignedIn} onChange={e=>setStaySignedIn(e.target.checked)} style={{accentColor:"#c9a84c",cursor:"pointer"}}/>
            <span>Stay signed in on this device</span>
          </label>}
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
  const inp={background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.18)",color:"#f4edd8",colorScheme:"dark",borderRadius:8,padding:"8px 12px",fontSize:12,fontFamily:"inherit",width:"100%",boxSizing:"border-box",transition:"all .2s"};
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


// ── RESUME TEXT PARSER (no AI — pure heuristics) ──────────────────────────────
function parseResumeText(text){
  const clean=text.replace(/\r/g,"").replace(/\t/g," ");
  const lines=clean.split("\n").map(l=>l.trim()).filter(Boolean);
  const flat=clean.replace(/\s+/g," ").trim();
  const out={};

  // Email
  const email=flat.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if(email)out.emailAddress=email[0];

  // Name — usually the first non-empty line, 2-4 words, no digits/@
  for(const l of lines.slice(0,5)){
    if(/@|\d{3}/.test(l))continue;
    const words=l.split(/\s+/);
    if(words.length>=2&&words.length<=4&&/^[A-Za-z][A-Za-z.'-]*$/.test(words[0])&&l.length<46){out.name=l;break;}
  }

  // Location — look for "City, ST" pattern
  const loc=flat.match(/\b([A-Z][a-zA-Z.\- ]+),\s*([A-Z]{2})\b/);
  if(loc)out.location=`${loc[1].trim()}, ${loc[2]}`;

  // Role / current title — look for common title keywords near the top
  const titleRe=/(Senior |Junior |Lead |Principal |Staff )?(Game |Gameplay |Technical |Software |Systems |UI\/?UX |3D |Environment |Character |Narrative |Level )?(Designer|Developer|Engineer|Artist|Programmer|Producer|Animator|Writer|Manager|Director|Analyst)/i;
  for(const l of lines.slice(0,8)){
    const m=l.match(titleRe);
    if(m&&l.length<60){out.role=m[0].trim();break;}
  }
  if(!out.role){const m=flat.match(titleRe);if(m)out.role=m[0].trim();}

  // Education — find a line mentioning a degree
  const eduLine=lines.find(l=>/\b(B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|Bachelor|Master|Associate|Ph\.?D|Diploma|Certificate)\b/i.test(l)&&l.length<120);
  if(eduLine)out.education=eduLine;

  // Skills — find a "Skills" section and grab the following content
  const skillsIdx=lines.findIndex(l=>/^(technical )?skills\b/i.test(l)||/^(core )?competencies\b/i.test(l));
  if(skillsIdx>-1){
    const after=lines.slice(skillsIdx+1,skillsIdx+6).join(", ");
    // stop at next section header
    const cut=after.split(/\b(experience|education|projects|employment|work history)\b/i)[0];
    if(cut&&cut.length>3)out.skills=cut.replace(/^[:\-\s]+/,"").slice(0,400);
  }

  // Years of experience — look for "X years"
  const yrs=flat.match(/(\d{1,2})\+?\s*years?(\s+of)?\s+(experience|exp)/i);
  if(yrs){const n=parseInt(yrs[1]);out.experience=n<1?"0-1 years":n<2?"1-2 years":n<4?"2-4 years":n<7?"4-7 years":n<10?"7-10 years":"10+ years";}

  // Bio — first sentence of a summary/objective section, else first long line
  const sumIdx=lines.findIndex(l=>/^(summary|profile|objective|about)\b/i.test(l));
  if(sumIdx>-1&&lines[sumIdx+1]){out.bio=lines[sumIdx+1].slice(0,300);}

  // Work history — capture lines under an Experience/Employment heading
  const expIdx=lines.findIndex(l=>/^(work )?(experience|employment|professional experience|work history)\b/i.test(l));
  if(expIdx>-1){
    const stopRe=/^(education|skills|projects|certifications|awards|references|interests)\b/i;
    const collected=[];
    for(let i=expIdx+1;i<lines.length&&collected.length<8;i++){
      if(stopRe.test(lines[i]))break;
      if(lines[i].length>4)collected.push(lines[i]);
    }
    if(collected.length)out.workHistory=collected.join(" • ").slice(0,600);
  }

  // Achievements — lines with measurable wins (numbers, %, "increased/reduced/led")
  const achLines=lines.filter(l=>/\b(increased|reduced|improved|led|shipped|launched|grew|achieved|delivered|saved|generated|\d+%|\$\d)/i.test(l)&&l.length>15&&l.length<200);
  if(achLines.length)out.achievements=achLines.slice(0,5).join(" • ").slice(0,500);

  return out;
}

// Auto-resizing textarea: grows with content up to maxHeight, then scrolls.
function AutoTextarea({value,onChange,placeholder,style,minHeight=70,maxHeight=220}) {
  const ref = useRef(null);
  useEffect(()=>{
    const el=ref.current; if(!el)return;
    el.style.height="auto";
    const h=Math.min(el.scrollHeight,maxHeight);
    el.style.height=h+"px";
    el.style.overflowY=el.scrollHeight>maxHeight?"auto":"hidden";
  },[value,maxHeight]);
  return <textarea ref={ref} value={value} onChange={onChange} placeholder={placeholder}
    style={{...style,minHeight,maxHeight,resize:"none",overflowY:"hidden"}}/>;
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
      let text="";
      if(ext===".pdf"){
        setMsg("Extracting PDF text…");
        // Load PDF.js dynamically (no AI, runs entirely in the browser)
        if(typeof window.pdfjsLib==="undefined"){
          await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});
          window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }
        const buf=await new Promise((res,rej)=>{const r=new FileReader();r.onload=ev=>res(ev.target.result);r.onerror=rej;r.readAsArrayBuffer(file);});
        const pdf=await window.pdfjsLib.getDocument({data:buf}).promise;
        for(let i=1;i<=pdf.numPages;i++){
          const page=await pdf.getPage(i);
          const tc=await page.getTextContent();
          text+=tc.items.map(it=>it.str).join(" ")+"\n";
        }
      } else if(ext===".txt"){
        text=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsText(file);});
      } else {
        // DOCX: load mammoth dynamically
        setMsg("Extracting DOCX text…");
        if(typeof window.mammoth==="undefined"){
          await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});
        }
        const buf=await new Promise((res,rej)=>{const r=new FileReader();r.onload=ev=>res(ev.target.result);r.onerror=rej;r.readAsArrayBuffer(file);});
        const result=await window.mammoth.extractRawText({arrayBuffer:buf});
        text=result.value||"";
      }
      if(!text||text.trim().length<20){throw new Error("Could not read text from this file. Try a different file or fill fields manually.");}
      setPs("parsing");setMsg("Parsing resume…");
      // Heuristic (non-AI) field extraction
      const parsed=parseResumeText(text);
      Object.entries(parsed).forEach(([k,v])=>{if(v&&typeof v==="string"&&v.trim())updateField(k,v.trim());});
      // Always store the full text so the user has it
      updateField("resumeText",text.replace(/\s+/g," ").trim().slice(0,8000));
      updateField("resumeFileName",file.name);
      setPs("done");setMsg("Resume text extracted! Review and edit the fields below.");
    }catch(err){setPs("error");setMsg(err.message||"Could not parse. Try a different file or paste text manually.");}
    if(fileRef.current)fileRef.current.value="";
  };

  const inp={background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.18)",color:"#f4edd8",colorScheme:"dark",borderRadius:8,padding:"8px 12px",fontSize:12,fontFamily:"inherit",width:"100%",boxSizing:"border-box"};
  const lbl={fontSize:10,color:"rgba(201,168,76,.7)",textTransform:"uppercase",letterSpacing:.8,fontFamily:"'Cinzel',serif",marginBottom:4,display:"block"};
  const fld={display:"flex",flexDirection:"column",gap:4,marginBottom:12};
  const G="linear-gradient(135deg,#c9a84c,#e8613a)";
  const zoneColor=ps==="done"?"rgba(126,207,179,.35)":ps==="error"?"rgba(192,50,26,.35)":"rgba(201,168,76,.25)";
  const zoneBg=ps==="done"?"rgba(126,207,179,.04)":ps==="error"?"rgba(192,50,26,.04)":"rgba(201,168,76,.03)";
  const msgColor=ps==="done"?"#7ecfb3":ps==="error"?"#e07060":"rgba(244,237,216,.7)";

  return <div>
    <p style={{fontSize:12,color:"rgba(244,237,216,.5)",fontStyle:"italic",marginBottom:14}}>Upload your resume (PDF, DOCX, or TXT) to auto-fill your profile fields. Everything is processed in your browser — review and edit below.</p>
    {/* Active resume card (shown when a resume is saved) OR the upload zone */}
    {(profile.resumeText&&ps!=="reading"&&ps!=="parsing"&&ps!=="error")?(
      <div style={{border:"1px solid rgba(126,207,179,.3)",borderRadius:12,padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,background:"rgba(126,207,179,.05)",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
          <div style={{flexShrink:0}}><I.Scroll s={24} c="#7ecfb3"/></div>
          <div style={{minWidth:0}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:700,color:"#7ecfb3",marginBottom:2}}>Active Resume</div>
            <div style={{fontSize:12,color:"rgba(244,237,216,.7)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{profile.resumeFileName||"Resume on file"}</div>
          </div>
        </div>
        <button title="Remove resume" onClick={()=>{if(window.confirm("Remove the uploaded resume? Your other profile fields will stay.")){updateField("resumeText","");updateField("resumeFileName","");setPs("idle");setMsg("");}}} style={{background:"rgba(192,50,26,.1)",border:"1px solid rgba(192,50,26,.3)",color:"#e07060",cursor:"pointer",borderRadius:8,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:15,fontWeight:700,lineHeight:1}}>✕</button>
      </div>
    ):(
    <div onClick={()=>ps!=="parsing"&&ps!=="reading"&&fileRef.current?.click()} onDragOver={e=>{e.preventDefault();}} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f){const dt=new DataTransfer();dt.items.add(f);fileRef.current.files=dt.files;upload({target:fileRef.current});}}} style={{border:`1.5px dashed ${zoneColor}`,borderRadius:12,padding:"24px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:8,cursor:ps==="parsing"||ps==="reading"?"default":"pointer",transition:"all .2s",background:zoneBg,marginBottom:16,textAlign:"center"}}>
      <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" style={{display:"none"}} onChange={upload}/>
      {ps==="idle"&&<><I.Scroll s={26} c="#c9a84c"/><div style={{fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:700,color:"#f4edd8"}}>Upload Resume</div><div style={{fontSize:11,color:"rgba(244,237,216,.4)"}}>PDF, DOCX, or TXT · Max 10MB</div><div style={{background:G,border:"none",color:"#0a0608",borderRadius:8,padding:"7px 18px",fontSize:11,fontWeight:700,fontFamily:"'Cinzel',serif",cursor:"pointer",marginTop:4}}>Choose File or Drag & Drop</div></>}
      {(ps==="reading"||ps==="parsing")&&<><I.Sparkle s={26} c="#c9a84c"/><div style={{fontSize:12,color:"rgba(244,237,216,.7)",fontFamily:"'Cinzel',serif"}}>{msg}</div></>}
      {ps==="error"&&<><I.X s={26} c="#e07060"/><div style={{fontSize:12,color:"#e07060",fontFamily:"'Cinzel',serif"}}>{msg}</div><div style={{background:G,border:"none",color:"#0a0608",borderRadius:8,padding:"7px 18px",fontSize:11,fontWeight:700,fontFamily:"'Cinzel',serif",cursor:"pointer"}}>Try Again</div></>}
    </div>
    )}
    <div style={fld}><label style={lbl}>Key Skills</label><AutoTextarea style={inp} minHeight={70} maxHeight={200} value={profile.skills||""} onChange={e=>updateField("skills",e.target.value)} placeholder="e.g. Unreal Engine 5, C++, Blueprint scripting, multiplayer..."/></div>
    <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:12,marginBottom:12}}>
      <div style={fld}><label style={lbl}>Experience Level</label><select style={inp} value={profile.experience||""} onChange={e=>updateField("experience",e.target.value)}><option value="">Select</option><option value="0-1 years">0-1 years</option><option value="1-2 years">1-2 years</option><option value="2-4 years">2-4 years</option><option value="4-7 years">4-7 years</option><option value="7-10 years">7-10 years</option><option value="10+ years">10+ years</option></select></div>
      <div style={fld}><label style={lbl}>Target Salary</label><input style={inp} value={profile.targetSalary||""} onChange={e=>updateField("targetSalary",e.target.value)} placeholder="e.g. $90k–$120k"/></div>
    </div>
    <div style={fld}><label style={lbl}>Education</label><input style={inp} value={profile.education||""} onChange={e=>updateField("education",e.target.value)} placeholder="e.g. BS Computer Science, DigiPen, 2022"/></div>
    <div style={fld}><label style={lbl}>Work History Summary</label><AutoTextarea style={inp} minHeight={80} maxHeight={260} value={profile.workHistory||""} onChange={e=>updateField("workHistory",e.target.value)} placeholder="e.g. Junior Programmer at Studio X (2022–2024): shipped 2 mobile titles..."/></div>
    <div style={fld}><label style={lbl}>Key Achievements</label><AutoTextarea style={inp} minHeight={70} maxHeight={220} value={profile.achievements||""} onChange={e=>updateField("achievements",e.target.value)} placeholder="e.g. Reduced load times 40%, shipped game with 50k downloads..."/></div>
  </div>;
}

// ── EMAIL TEMPLATE TAB ────────────────────────────────────────────────────────
// User writes a template with [x] placeholders. One dropdown per [x], in order.
// Each dropdown maps that [x] to either Company Name or Position Title.
// On email-apply, placeholders are filled from the job being applied to.
function EmailTemplateTab({profile,upd}){
  const text=profile.emailTemplate||"";
  const mappings=profile.emailTemplateMap||[];
  // Count [x] placeholders in order
  const placeholderCount=(text.match(/\[x\]/gi)||[]).length;
  // Dropdown options for [x] — job info plus any links the user has filled in.
  const OPTIONS=[["company","Company Name"],["position","Position Title"],
    ...(profile.linkedin?[["linkedin","LinkedIn URL"]]:[]),
    ...(profile.portfolio?[["portfolio","Portfolio URL"]]:[]),
    ...(profile.github?[["github","GitHub URL"]]:[]),
    ...(profile.artstation?[["artstation","ArtStation URL"]]:[]),
    ...(profile.behance?[["behance","Behance URL"]]:[]),
    ...(profile.otherWebsite?[["otherWebsite","Other Website URL"]]:[]),
  ];
  const hasResume=!!(profile.resumeText||profile.resumeFileName);

  const inp={background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.18)",color:"#f4edd8",colorScheme:"dark",borderRadius:8,padding:"10px 12px",fontSize:12,fontFamily:"inherit",width:"100%",boxSizing:"border-box"};
  const lbl={fontSize:10,color:"rgba(201,168,76,.7)",textTransform:"uppercase",letterSpacing:.8,fontFamily:"'Cinzel',serif",marginBottom:6,display:"block"};

  const setMapping=(i,val)=>{
    const next=[...mappings];
    next[i]=val;
    upd("emailTemplateMap",next);
  };

  // Build a live preview using sample values
  const OPT_LABELS=Object.fromEntries(OPTIONS);
  const preview=(()=>{
    if(!text)return "";
    let n=-1;
    return text.replace(/\[x\]/gi,()=>{
      n++;
      const m=mappings[n];
      if(m&&OPT_LABELS[m])return `[${OPT_LABELS[m].replace(/ URL$/,"")}]`;
      return "[x]";
    });
  })();

  return <div>
    {/* Preferred email provider (moved here from Links) */}
    <div style={{marginBottom:16}}>
      <label style={lbl}>Preferred Email Provider</label>
      <p style={{fontSize:11,color:"rgba(244,237,216,.45)",marginBottom:8,lineHeight:1.4}}>When you Apply by Email, we'll open a pre-filled draft in this provider's web compose window.</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{[["gmail","Gmail"],["outlook","Outlook"],["yahoo","Yahoo Mail"],["default","Default Mail App"]].map(([id,label])=><button key={id} onClick={()=>upd("emailProvider",id)} style={{background:profile.emailProvider===id?"rgba(201,168,76,.15)":"rgba(244,237,216,.04)",border:`1px solid ${profile.emailProvider===id?"rgba(201,168,76,.4)":"rgba(244,237,216,.1)"}`,color:profile.emailProvider===id?"#f0d080":"rgba(244,237,216,.5)",cursor:"pointer",borderRadius:8,padding:"8px 12px",fontSize:12,fontFamily:"'Cinzel',serif",display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>{profile.emailProvider===id&&<I.Check s={11} c="#0a0608"/>}{label}</button>)}</div>
    </div>
    {/* Auto-attach resume checkbox */}
    <label onClick={()=>upd("autoAttachResume",!profile.autoAttachResume)} style={{display:"flex",alignItems:"flex-start",gap:9,cursor:"pointer",userSelect:"none",marginBottom:16,background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.12)",borderRadius:8,padding:"11px 13px"}}>
      <div style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${profile.autoAttachResume?"#c9a84c":"rgba(201,168,76,.3)"}`,background:profile.autoAttachResume?"#c9a84c":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{profile.autoAttachResume&&<I.Check s={10} c="#0a0608"/>}</div>
      <div>
        <div style={{fontSize:12,color:"#f4edd8",fontWeight:600}}>Auto-attach my resume to email applications</div>
        <div style={{fontSize:10.5,color:"rgba(244,237,216,.45)",marginTop:2}}>{hasResume?"Your saved resume will be attached when you Apply by Email.":"Upload a resume in the Resume tab to enable this."}</div>
      </div>
    </label>
    <p style={{fontSize:12,color:"rgba(244,237,216,.5)",fontStyle:"italic",marginBottom:14,lineHeight:1.5}}>Write your email template below. Type <strong style={{color:"#c9a84c"}}>[x]</strong> anywhere you want auto-filled info. A dropdown appears for each [x] so you can assign it to a value like Company Name, Position Title, or one of your links. When you Apply by Email, the [x]'s are filled in from that job.</p>
    <div style={{marginBottom:14}}>
      <label style={lbl}>Email Template</label>
      <textarea style={{...inp,minHeight:160,resize:"vertical",lineHeight:1.5}} value={text} onChange={e=>upd("emailTemplate",e.target.value)} placeholder={"Dear [x] Hiring Team,\n\nI'm excited to apply for the [x] role at [x]. ..."}/>
    </div>
    {placeholderCount>0&&<div style={{marginBottom:14}}>
      <label style={lbl}>Assign each [x] ({placeholderCount} found)</label>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {Array.from({length:placeholderCount}).map((_,i)=>
          <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:11,color:"rgba(244,237,216,.5)",fontFamily:"'Cinzel',serif",minWidth:64}}>[x] #{i+1}</span>
            <select style={{...inp,flex:1}} value={mappings[i]||""} onChange={e=>setMapping(i,e.target.value)}>
              <option value="">— Select —</option>
              {OPTIONS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>}
    {text&&<div>
      <label style={lbl}>Preview</label>
      <div style={{background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.1)",borderRadius:8,padding:12,fontSize:12,color:"rgba(244,237,216,.65)",whiteSpace:"pre-wrap",lineHeight:1.5}}>{preview}</div>
    </div>}
  </div>;
}

// Validates and manages a single profile link with per-type URL checking.
function LinkField({fieldKey,label,icon,placeholder,value,onChange}) {
  const [editing,setEditing]=useState(!value);
  const [draft,setDraft]=useState(value||"");
  const [error,setError]=useState("");

  // Per-type validation: the URL must match the expected domain for that link type.
  const validators={
    linkedin:{re:/^https?:\/\/(www\.)?linkedin\.com\/.+/i,msg:"Enter a valid LinkedIn URL (linkedin.com/...)"},
    portfolio:{re:/^https?:\/\/.+\..+/i,msg:"Enter a valid website URL (https://...)"},
    github:{re:/^https?:\/\/(www\.)?github\.com\/.+/i,msg:"Enter a valid GitHub URL (github.com/...)"},
    artstation:{re:/^https?:\/\/(www\.)?artstation\.com\/.+/i,msg:"Enter a valid ArtStation URL (artstation.com/...)"},
    behance:{re:/^https?:\/\/(www\.)?behance\.net\/.+/i,msg:"Enter a valid Behance URL (behance.net/...)"},
    otherWebsite:{re:/^https?:\/\/.+\..+/i,msg:"Enter a valid website URL (https://...)"},
  };

  const validate=(url)=>{
    const u=url.trim();
    if(!u)return "Please enter a link.";
    const v=validators[fieldKey];
    if(v&&!v.re.test(u))return v.msg;
    return "";
  };

  const save=()=>{
    const err=validate(draft);
    if(err){setError(err);return;}
    setError("");
    onChange(draft.trim());
    setEditing(false);
  };

  const clear=()=>{
    setDraft("");
    setError("");
    onChange("");
    setEditing(true);
  };

  const inpStyle={background:"rgba(201,168,76,.06)",border:`1px solid ${error?"#c0532a":"rgba(201,168,76,.18)"}`,color:"#f4edd8",colorScheme:"dark",borderRadius:8,padding:"10px 12px",fontSize:12,fontFamily:"inherit",width:"100%",boxSizing:"border-box",outline:"none"};
  const lblStyle={fontSize:10,color:"rgba(201,168,76,.7)",textTransform:"uppercase",letterSpacing:.8,fontFamily:"'Cinzel',serif",marginBottom:6,display:"flex",alignItems:"center",gap:6};

  if(!editing&&value){
    // Verified/connected state: icon + name + green check + X to change
    return <div style={{marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(126,207,179,.06)",border:"1px solid rgba(126,207,179,.3)",borderRadius:8,padding:"10px 12px"}}>
        <span style={{color:"#7ecfb3",display:"flex"}}>{icon}</span>
        <span style={{fontSize:12,color:"#f4edd8",fontWeight:600}}>{label}</span>
        <a href={value} target="_blank" rel="noreferrer" style={{fontSize:11,color:"rgba(244,237,216,.45)",textDecoration:"none",flex:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{value.replace(/^https?:\/\/(www\.)?/,"")}</a>
        <span title="Connected" style={{color:"#7ecfb3",display:"flex",flexShrink:0}}><I.Check s={14} c="#7ecfb3"/></span>
        <button onClick={clear} title="Change link" style={{background:"rgba(192,50,26,.1)",border:"1px solid rgba(192,50,26,.3)",color:"#e07060",cursor:"pointer",borderRadius:6,width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,lineHeight:1}}>✕</button>
      </div>
    </div>;
  }

  // Editing state: input + validate-on-blur/save
  return <div style={{marginBottom:12}}>
    <label style={lblStyle}>{icon}{label}</label>
    <div style={{display:"flex",gap:6}}>
      <input style={inpStyle} value={draft} onChange={e=>{setDraft(e.target.value);if(error)setError("");}} onKeyDown={e=>e.key==="Enter"&&save()} placeholder={placeholder}/>
      <button onClick={save} style={{background:"rgba(201,168,76,.15)",border:"1px solid rgba(201,168,76,.4)",color:"#f0d080",cursor:"pointer",borderRadius:8,padding:"0 14px",fontSize:11,fontWeight:700,fontFamily:"'Cinzel',serif",flexShrink:0}}>Verify</button>
    </div>
    {error&&<div style={{fontSize:10.5,color:"#e07060",marginTop:5}}>{error}</div>}
  </div>;
}

// ── ACCOUNT PANEL ─────────────────────────────────────────────────────────────
function AccountPanel({user,onClose,onUpdate,onLogout}) {
  const mobile = useIsMobile();
  const [tab,setTab]=useState("profile");
  const [p,setP]=useState({name:user.name||"",bio:user.profile?.bio||"",location:user.profile?.location||"",linkedin:user.profile?.linkedin||"",portfolio:user.profile?.portfolio||"",github:user.profile?.github||"",role:user.profile?.role||"",experience:user.profile?.experience||user.profile?.yearsExp||"",openTo:user.profile?.openTo||[],skills:user.profile?.skills||"",education:user.profile?.education||"",workHistory:user.profile?.workHistory||"",achievements:user.profile?.achievements||"",targetSalary:user.profile?.targetSalary||"",resumeText:user.profile?.resumeText||"",emailAddress:user.profile?.emailAddress||"",emailProvider:user.profile?.emailProvider||"gmail",emailTemplate:user.profile?.emailTemplate||"",emailTemplateMap:user.profile?.emailTemplateMap||[],autoAttachResume:user.profile?.autoAttachResume||false,resumeFileName:user.profile?.resumeFileName||"",artstation:user.profile?.artstation||"",behance:user.profile?.behance||"",otherWebsite:user.profile?.otherWebsite||"",notifyCompanies:user.profile?.notifyCompanies||[],alertAll:user.profile?.alertAll||false,notifications:user.profile?.notifications!==false,emailAlerts:user.profile?.emailAlerts||false});
  const [saved,setSaved]=useState(false);
  const upd=(k,v)=>setP(prev=>({...prev,[k]:v}));
  const toggleOt=(v)=>setP(prev=>({...prev,openTo:prev.openTo.includes(v)?prev.openTo.filter(x=>x!==v):[...prev.openTo,v]}));
  const save = async () => {
    if (user?.id) {
      // Store the entire profile as JSON so every field persists (incl. resume, template, links)
      const { error } = await supabase.from("profiles").upsert({ id: user.id, name: p.name, data: p }, { onConflict: "id" });
      if (error) { console.error("Profile save error:", error.message); }
    }
    onUpdate({ ...user, name: p.name, profile: p });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const initials=p.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"?";
  const G="linear-gradient(135deg,#c9a84c,#e8613a)";
  const inp={background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.18)",color:"#f4edd8",colorScheme:"dark",borderRadius:8,padding:"8px 12px",fontSize:12,fontFamily:"inherit",width:"100%",boxSizing:"border-box"};
  const lbl={fontSize:10,color:"rgba(201,168,76,.7)",textTransform:"uppercase",letterSpacing:.8,fontFamily:"'Cinzel',serif",marginBottom:4,display:"block"};
  const fld={display:"flex",flexDirection:"column",gap:4,marginBottom:12};
  const tabs=[["profile","Profile",<I.Person s={14} c="currentColor"/>],["resume","Resume",<I.Scroll s={14} c="currentColor"/>],["links","Links",<I.Link s={14} c="currentColor"/>],["template","Email Template",<I.Send s={14} c="currentColor"/>],["account","Account",<I.Lock s={14} c="currentColor"/>]];

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
          <div style={fld}><label style={lbl}>Experience Level</label><select style={inp} value={p.experience||""} onChange={e=>upd("experience",e.target.value)}><option value="">Select</option><option value="0-1 years">0-1 years</option><option value="1-2 years">1-2 years</option><option value="2-4 years">2-4 years</option><option value="4-7 years">4-7 years</option><option value="7-10 years">7-10 years</option><option value="10+ years">10+ years</option></select></div>
          <div style={fld}><label style={lbl}>Bio</label><textarea style={{...inp,minHeight:70,resize:"vertical"}} value={p.bio} onChange={e=>upd("bio",e.target.value)} placeholder="Short professional summary..."/></div>
          <div style={fld}><label style={lbl}>Open To</label><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{["Full-time","Contract","Remote","Hybrid","On-site","Relocation"].map(opt=><button key={opt} onClick={()=>toggleOt(opt)} style={{background:p.openTo.includes(opt)?"rgba(201,168,76,.18)":"rgba(244,237,216,.05)",border:`1px solid ${p.openTo.includes(opt)?"rgba(201,168,76,.4)":"rgba(244,237,216,.1)"}`,color:p.openTo.includes(opt)?"#f0d080":"rgba(244,237,216,.5)",cursor:"pointer",borderRadius:20,fontSize:11,padding:"4px 14px",fontFamily:"inherit"}}>{opt}</button>)}</div></div>
        </div>}
        {tab==="resume"&&<ResumeSection profile={p} updateField={upd}/>}
        {tab==="links"&&<div>
          <p style={{fontSize:12,color:"rgba(244,237,216,.5)",fontStyle:"italic",marginBottom:14}}>Add your professional links. Each is checked to make sure it matches the right site before it's saved.</p>
          {[["linkedin","LinkedIn",<I.Globe s={12} c="currentColor"/>,"https://linkedin.com/in/yourname"],["portfolio","Portfolio",<I.Globe s={12} c="currentColor"/>,"https://yourportfolio.com"],["github","GitHub",<I.Link s={12} c="currentColor"/>,"https://github.com/yourhandle"],["artstation","ArtStation",<I.Globe s={12} c="currentColor"/>,"https://artstation.com/yourname"],["behance","Behance",<I.Globe s={12} c="currentColor"/>,"https://behance.net/yourname"],["otherWebsite","Other Website",<I.Link s={12} c="currentColor"/>,"https://yourwebsite.com"]].map(([k,label,icon,ph])=>
            <LinkField key={k} fieldKey={k} label={label} icon={icon} placeholder={ph} value={p[k]||""} onChange={v=>upd(k,v)}/>)}
        </div>}
        {tab==="template"&&<EmailTemplateTab profile={p} upd={upd}/>}
        {tab==="account"&&<div>
          {/* Email Alerts */}
          <div style={{fontSize:10,color:"rgba(201,168,76,.6)",textTransform:"uppercase",letterSpacing:.8,fontFamily:"'Cinzel',serif",marginBottom:8}}>Email Alerts</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:14,background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.08)",borderRadius:10,marginBottom:10}}>
            <div><div style={{fontSize:13,fontWeight:500,color:"#f4edd8",marginBottom:2}}>Alert me for all new postings</div><div style={{fontSize:11,color:"rgba(244,237,216,.4)"}}>{p.alertAll?"You'll be alerted about every company.":"Only the companies you've turned on below."}</div></div>
            <button onClick={()=>upd("alertAll",!p.alertAll)} style={{width:42,height:24,background:p.alertAll?"#c9a84c":"rgba(244,237,216,.08)",border:"none",borderRadius:12,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
              <div style={{position:"absolute",width:18,height:18,background:"#f4edd8",borderRadius:"50%",top:3,left:3,transition:"transform .2s",transform:p.alertAll?"translateX(18px)":"none"}}/>
            </button>
          </div>
          {/* Per-company notification list — hidden when "alert all" is on */}
          {!p.alertAll&&<div style={{marginBottom:10}}>
            <div style={{fontSize:10.5,color:"rgba(244,237,216,.45)",marginBottom:8,lineHeight:1.4}}>Companies you're getting alerts for. Click the bell to remove one. (Turn on notifications from any company on the job board using its bell icon.)</div>
            {(p.notifyCompanies||[]).length===0?
              <div style={{fontSize:11,color:"rgba(244,237,216,.35)",fontStyle:"italic",padding:"10px 12px",background:"rgba(201,168,76,.02)",border:"1px dashed rgba(201,168,76,.15)",borderRadius:8,textAlign:"center"}}>No companies yet. Click the bell icon next to a company on the job board to add it here.</div>
              :<div style={{display:"flex",flexDirection:"column",gap:6}}>
                {(p.notifyCompanies||[]).map(cn=>
                  <div key={cn} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"9px 12px",background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.1)",borderRadius:8}}>
                    <span style={{fontSize:12,color:"#f4edd8"}}>{cn}</span>
                    <span onClick={()=>upd("notifyCompanies",(p.notifyCompanies||[]).filter(x=>x!==cn))} title="Turn off notifications for this company" style={{cursor:"pointer",display:"flex",flexShrink:0}}><I.Bell s={14} c="#c9a84c" fill="#c9a84c"/></span>
                  </div>)}
              </div>}
          </div>}
          {/* In-app notifications toggle */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:14,background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.08)",borderRadius:10,marginBottom:10}}>
            <div><div style={{fontSize:13,fontWeight:500,color:"#f4edd8",marginBottom:2}}>In-app Notifications</div><div style={{fontSize:11,color:"rgba(244,237,216,.4)"}}>Show new-posting badges while browsing</div></div>
            <button onClick={()=>upd("notifications",!p.notifications)} style={{width:42,height:24,background:p.notifications?"#c9a84c":"rgba(244,237,216,.08)",border:"none",borderRadius:12,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
              <div style={{position:"absolute",width:18,height:18,background:"#f4edd8",borderRadius:"50%",top:3,left:3,transition:"transform .2s",transform:p.notifications?"translateX(18px)":"none"}}/>
            </button>
          </div>
          <div style={{fontSize:10,color:"rgba(201,168,76,.6)",textTransform:"uppercase",letterSpacing:.8,fontFamily:"'Cinzel',serif",margin:"18px 0 8px"}}>Account Details</div>
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
  const synthetic={id:`noop-${companyName}`,title:"General Application",company:companyName,url:company.url,applyUrl:company.url,email:company.email||"",summary:`Open application to ${companyName}.`,responsibilities:[],requirements:[],experience:"",type:"Full-time",salary:"",isRemote:false,isVolunteer:!!company.volunteer};
  const btn=(lbl,icon,onClick,style={})=><button onClick={onClick} style={{background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.25)",color:"#f0d080",cursor:"pointer",borderRadius:7,padding:"5px 11px",fontSize:10,fontFamily:"'Cinzel',serif",fontWeight:700,display:"inline-flex",alignItems:"center",gap:5,transition:"all .15s",...style}}>{icon}{lbl}</button>;
  return <>
    <div style={{background:"rgba(201,168,76,.03)",border:"1px dashed rgba(201,168,76,.15)",borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"flex-start",gap:12}}>
      <I.Scroll s={18} c="rgba(201,168,76,.45)"/>
      <div style={{flex:1}}><p style={{fontSize:12,fontWeight:600,color:"rgba(244,237,216,.6)",margin:"0 0 2px",display:"flex",alignItems:"center",gap:7}}>{company.volunteer&&<span style={{background:"rgba(126,207,179,.12)",border:"1px solid rgba(126,207,179,.3)",color:"#7ecfb3",borderRadius:20,fontSize:9,padding:"1px 8px",fontFamily:"'Cinzel',serif",fontWeight:700}}>Volunteer</span>}<span>{company.volunteer?"Volunteer opportunities — reach out to get involved.":"No current listings — they may still be hiring."}</span></p><p style={{fontSize:11,color:"rgba(244,237,216,.4)",margin:0}}>Visit their careers page or send a general application email.</p></div>
      <div style={{display:"flex",flexDirection:"column",gap:5,flexShrink:0}}>
        {company.url&&<a href={company.url} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>{btn("Careers",<I.Arrow s={10} c="#f0d080"/>,(()=>{}))}</a>}
        {company.contact&&<a href={company.contact} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>{btn("Contact Page",<I.Link s={10} c="#8fd0e8"/>,(()=>{}),{background:"rgba(96,160,232,.1)",border:"1px solid rgba(96,160,232,.3)",color:"#8fd0e8"})}</a>}
        {company.email&&<a href={`mailto:${company.email}?subject=${encodeURIComponent(`Inquiry about opportunities at ${companyName}`)}`} style={{textDecoration:"none"}}>{btn("Email",<I.Send s={10} c="#7ecfb3"/>,(()=>{}),{background:"rgba(126,207,179,.1)",border:"1px solid rgba(126,207,179,.3)",color:"#7ecfb3"})}</a>}
              </div>
    </div>
  </>;
}

// ── ATS SCORER ───────────────────────────────────────────────────────────────
// Module-level caches so scores aren't recomputed on every render/filter/sort.
const _MATCH_STOP=new Set(["and","the","for","with","this","that","are","you","will","have","from","our","your","able","more","some","they","into","its","can","use","all","any","work","team","years","year","role","who","what","when","their","has","was","were","been","being","but","not","other","such","than","then","them","these","those","also","may","must","should","would","could","about","across","within","using","including","etc","strong","plus","preferred","required","experience","skills","ability","knowledge","understanding","to","in","of","a","an","or","on","at","by","as","be","is","it","do","we","he","she","per","via","out","up","off","over","under","new","one","two","get","got","make","made","help","like","well","good","great","join","build","building","create","creating","develop","developing"]);
const _matchTokenize=t=>(t.match(/[a-z][a-z0-9+#.]{2,}/g)||[]).filter(w=>!_MATCH_STOP.has(w));
let _profileCache={key:null,profileSet:null,skillSet:null,corpus:null,yexp:""};
const _scoreCache=new Map(); // jobId+profileKey -> result

// A short signature of the profile so we know when to invalidate caches.
function _profileKey(p){
  if(!p)return "";
  return `${(p.skills||"").length}|${(p.education||"").length}|${(p.role||"").length}|${(p.workHistory||"").length}|${(p.achievements||"").length}|${(p.bio||"").length}|${p.yearsExp||""}`;
}

function computeMatchScore(job,profile){
  if(!profile)return null;
  const pKey=_profileKey(profile);

  // (Re)build the profile token sets only when the profile actually changes.
  if(_profileCache.key!==pKey){
    const skillsText=(profile.skills||"").toLowerCase();
    const corpus=[profile.skills||"",profile.role||"",profile.bio||"",profile.workHistory||"",profile.achievements||"",profile.education||""].join(" ").toLowerCase();
    if(!corpus.trim()||corpus.replace(/\s/g,"").length<25){
      _profileCache={key:pKey,profileSet:null,skillSet:null,corpus:"",yexp:""};
    } else {
      _profileCache={key:pKey,profileSet:new Set(_matchTokenize(corpus)),skillSet:new Set(_matchTokenize(skillsText)),corpus,yexp:(profile.yearsExp||"").toLowerCase()};
    }
    _scoreCache.clear(); // profile changed → old scores are stale
  }
  if(!_profileCache.profileSet)return null; // not enough profile data

  // Return cached score for this job if we already computed it.
  const cacheKey=(job.id||job.title)+"|"+pKey;
  if(_scoreCache.has(cacheKey))return _scoreCache.get(cacheKey);

  const tokenize=_matchTokenize;
  const profileSet=_profileCache.profileSet;
  const skillSet=_profileCache.skillSet;

  // Job keyword set (from title, requirements, responsibilities, summary)
  const titleKws=new Set(tokenize((job.title||"").toLowerCase()));
  const reqText=[...(job.requirements||[]),...(job.responsibilities||[])].join(" ").toLowerCase();
  const reqKws=new Set(tokenize(reqText));
  const bodyKws=new Set(tokenize([job.summary||"",job.fullDescription||""].join(" ").toLowerCase()));
  // Combined unique job keywords
  const allJobKws=new Set([...titleKws,...reqKws,...bodyKws]);
  if(allJobKws.size<3)return null; // not enough job data to score reliably

  // ── Weighted scoring ──
  // 1. Requirements/responsibilities overlap (most important) — 50%
  const reqArr=[...reqKws];
  const reqMatched=reqArr.filter(k=>profileSet.has(k));
  const reqScore=reqArr.length?reqMatched.length/reqArr.length:0;
  // 2. Title keyword overlap (role alignment) — 25%
  const titleArr=[...titleKws];
  const titleMatched=titleArr.filter(k=>profileSet.has(k));
  const titleScore=titleArr.length?titleMatched.length/titleArr.length:0;
  // 3. Skills section directly hitting the job — 15%
  const skillHits=[...allJobKws].filter(k=>skillSet.has(k)).length;
  const skillScore=Math.min(1,skillHits/8);
  // 4. Experience level alignment — 10%
  let expScore=0.5;
  const yexp=_profileCache.yexp;
  const jexp=(job.experience||"").toLowerCase();
  if(yexp&&jexp){
    const yNum=yexp.includes("10")?10:yexp.includes("7")?8:yexp.includes("4")?5:yexp.includes("2")?3:yexp.includes("1")?1.5:0.5;
    if(jexp.includes("entry")||jexp.includes("junior"))expScore=yNum<=3?1:yNum<=5?0.7:0.4;
    else if(jexp.includes("senior"))expScore=yNum>=5?1:yNum>=3?0.6:0.3;
    else if(jexp.includes("lead")||jexp.includes("principal")||jexp.includes("director"))expScore=yNum>=7?1:yNum>=4?0.6:0.25;
    else expScore=yNum>=2?0.85:0.55; // mid
  }

  const weighted=reqScore*0.50+titleScore*0.25+skillScore*0.15+expScore*0.10;
  // Convert to a 0-10 scale with a gentle curve so scores aren't all clustered low
  let score10=Math.round(Math.min(10,Math.max(0.5,weighted*13))*10)/10;

  // Missing requirement keywords the user might want to add (longer, meaningful words)
  const missing=reqArr.filter(k=>!profileSet.has(k)&&k.length>4).slice(0,5);

  const result={score:score10,reqMatched:reqMatched.length,reqTotal:reqArr.length,missing};
  _scoreCache.set(cacheKey,result);
  return result;
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
  const isApplied=user?.applied?.[job.id];
  const match=computeMatchScore(job,user?.profile);
  const scoreColor=match?(match.score>=7.5?"#7ecfb3":match.score>=5?"#c9a84c":match.score>=3?"#e8a070":"#c0703a"):"#888";
  // Does the user have enough profile data to score? (skills/resume/role/experience)
  const hasProfileData=!!(user&&user.profile&&((user.profile.skills||"").trim()||(user.profile.role||"").trim()||(user.profile.workHistory||"").trim()||(user.profile.education||"").trim()));
  const [showScoreInfo,setShowScoreInfo]=useState(false);
  const EXP_COLOR={"Entry Level":{bg:"rgba(78,240,197,.1)",br:"rgba(78,240,197,.25)",c:"#4ef0c5"},"Mid Level":{bg:"rgba(124,111,255,.1)",br:"rgba(124,111,255,.25)",c:"#a99fff"},"Senior":{bg:"rgba(255,111,176,.1)",br:"rgba(255,111,176,.25)",c:"#ff6fb0"},"Lead":{bg:"rgba(255,180,50,.1)",br:"rgba(255,180,50,.25)",c:"#ffb432"},"Principal":{bg:"rgba(255,140,80,.1)",br:"rgba(255,140,80,.25)",c:"#ff9a50"},"Director":{bg:"rgba(220,80,255,.1)",br:"rgba(220,80,255,.25)",c:"#dc50ff"}};
  const ec=EXP_COLOR[job.experience]||{bg:"rgba(244,237,216,.06)",br:"rgba(244,237,216,.12)",c:"rgba(244,237,216,.5)"};
  const onApply=()=>{
    if(job.isEmailApply&&job.applyEmail){
      const subj=job.company==="Break Away Games"?"BreakAway Online Job Posting":`Application: ${job.title} at ${job.company}`;
      const prof=user?.profile||{};
      // Fill the saved template's [x] placeholders from this job + the user's links
      let body="";
      const tmpl=prof.emailTemplate;
      const map=prof.emailTemplateMap||[];
      if(tmpl){
        let n=-1;
        body=tmpl.replace(/\[x\]/gi,()=>{
          n++;
          const m=map[n];
          if(m==="company")return job.company;
          if(m==="position")return job.title;
          if(m&&prof[m])return prof[m]; // link fields (linkedin, portfolio, etc.)
          return "";
        });
      }
      // If auto-attach is on and a resume exists, append a note (browsers can't auto-attach files to a draft)
      if(prof.autoAttachResume&&(prof.resumeText||prof.resumeFileName)){
        body+=(body?"\n\n":"")+"(Please find my resume attached.)";
      }
      const provider=prof.emailProvider||"default";
      const to=encodeURIComponent(job.applyEmail);
      const su=encodeURIComponent(subj);
      const bo=encodeURIComponent(body);
      let url;
      if(provider==="gmail") url=`https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${bo}`;
      else if(provider==="outlook") url=`https://outlook.office.com/mail/deeplink/compose?to=${to}&subject=${su}&body=${bo}`;
      else if(provider==="yahoo") url=`https://compose.mail.yahoo.com/?to=${to}&subject=${su}&body=${bo}`;
      else url=`mailto:${job.applyEmail}?subject=${su}&body=${bo}`;
      window.open(url,"_blank");
      // If auto-attach is on, remind the user to attach since web compose can't take a file automatically
      if(prof.autoAttachResume&&(prof.resumeText||prof.resumeFileName)){
        setTimeout(()=>{try{alert("Your draft is open. Don't forget to attach your resume — browsers can't attach it automatically for security reasons.");}catch{}},400);
      }
    } else {
      window.open(job.url,"_blank");
    }
    setTimeout(()=>setPrompt(true),2500);
  };
  const confirm=(yes)=>{setPrompt(false);if(yes)onApplied(job.id);};
  const G="linear-gradient(135deg,#c9a84c,#e8613a)";
  const chip=(children,style={})=><span style={{background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.15)",borderRadius:20,fontSize:10,padding:"2px 9px",color:"rgba(244,237,216,.65)",...style}}>{children}</span>;
  return <div style={{background:"rgba(16,10,22,.6)",border:`1px solid ${isApplied?"rgba(126,207,179,.3)":job.isNew?"rgba(192,50,26,.35)":"rgba(201,168,76,.12)"}`,borderRadius:10,padding:"13px 15px",transition:"all .2s",cursor:"default"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(201,168,76,.05)";e.currentTarget.style.transform="translateX(3px)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(16,10,22,.6)";e.currentTarget.style.transform="";}}>
    <div style={{display:"flex",gap:12,alignItems:"stretch"}}>
    <div style={{flex:1,minWidth:0}}>
    {/* Title row */}
        <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:7}}>
      {job.isNew&&<I.Alert s={18}/>}
      <span style={{fontSize:14,fontWeight:600,color:"#f4edd8"}}>{job.title}</span>
      {job.isVolunteer?<span style={{background:"rgba(126,207,179,.12)",border:"1px solid rgba(126,207,179,.3)",color:"#7ecfb3",borderRadius:20,fontSize:10,padding:"2px 9px",fontFamily:"'Cinzel',serif",fontWeight:700}}>Volunteer</span>:<span style={{background:ec.bg,border:`1px solid ${ec.br}`,color:ec.c,borderRadius:20,fontSize:10,padding:"2px 9px",fontFamily:"'Cinzel',serif",fontWeight:700,flexShrink:0}}>{job.experience}</span>}
      {isApplied&&<span style={{background:"rgba(126,207,179,.12)",border:"1px solid rgba(126,207,179,.3)",color:"#7ecfb3",borderRadius:20,fontSize:10,padding:"2px 9px",fontWeight:600}}><I.Check s={10} c="#7ecfb3"/> Applied</span>}
    </div>
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
      {(!job.responsibilities?.length&&!job.requirements?.length)&&<>{job.fullDescription?<p style={{fontSize:12,color:"rgba(244,237,216,.6)",lineHeight:1.6,margin:"0 0 8px",whiteSpace:"pre-wrap"}}>{job.fullDescription}</p>:<p style={{fontSize:12,color:"rgba(244,237,216,.4)",fontStyle:"italic",margin:"0 0 8px"}}>Visit the careers page for the full job description.</p>}<a href={job.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#c9a84c",textDecoration:"none",fontFamily:"'Cinzel',serif"}}>View Full Posting →</a></>}
    </div>}
    {/* Apply prompt */}
    {prompt&&<div style={{background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",borderRadius:8,padding:"9px 13px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8,fontSize:12,color:"rgba(244,237,216,.7)"}}>
      Did you apply?
      <button onClick={()=>confirm(true)} style={{background:"rgba(126,207,179,.15)",border:"1px solid rgba(126,207,179,.35)",color:"#7ecfb3",cursor:"pointer",borderRadius:6,fontSize:11,padding:"4px 12px",fontFamily:"'Cinzel',serif"}}>Yes!</button>
      <button onClick={()=>confirm(false)} style={{background:"rgba(244,237,216,.05)",border:"1px solid rgba(244,237,216,.1)",color:"rgba(244,237,216,.4)",cursor:"pointer",borderRadius:6,fontSize:11,padding:"4px 12px",fontFamily:"inherit"}}>Not yet</button>
    </div>}
    {/* Action buttons */}
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      <button onClick={onApply} style={{background:G,border:"none",color:"#0a0608",cursor:"pointer",borderRadius:7,padding:mobile?"9px 16px":"8px 18px",fontSize:11,fontWeight:800,fontFamily:"'Cinzel',serif",letterSpacing:.5,display:"inline-flex",alignItems:"center",gap:6,flex:mobile?"1":"none",justifyContent:"center"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 4px 16px rgba(201,168,76,.35)";}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>{job.isEmailApply?<><I.Send s={12} c="#0a0608"/>Apply by Email</>:<><I.Arrow s={12} c="#0a0608"/>View &amp; Apply</>}</button>
    </div>
    </div>
    {/* Match score square — shows score when profile has data, otherwise a prompt */}
    {user&&<div style={{flexShrink:0,width:mobile?58:66,position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,background:match?`${scoreColor}1a`:"rgba(201,168,76,.05)",border:`1px solid ${match?scoreColor+"55":"rgba(201,168,76,.18)"}`,borderRadius:10,padding:"6px 4px",alignSelf:"flex-start"}}>
      {/* Info icon */}
      <span onMouseEnter={()=>setShowScoreInfo(true)} onMouseLeave={()=>setShowScoreInfo(false)} onClick={e=>{e.stopPropagation();setShowScoreInfo(v=>!v);}} style={{position:"absolute",top:3,right:3,width:13,height:13,borderRadius:"50%",border:`1px solid ${match?scoreColor:"rgba(201,168,76,.5)"}99`,color:match?scoreColor:"rgba(201,168,76,.7)",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontFamily:"Georgia,serif",lineHeight:1,userSelect:"none"}}>i</span>
      {showScoreInfo&&<div style={{position:"absolute",top:"100%",right:0,marginTop:6,width:210,background:"rgba(20,14,10,.98)",border:`1px solid ${match?scoreColor+"55":"rgba(201,168,76,.3)"}`,borderRadius:8,padding:"9px 11px",fontSize:10.5,lineHeight:1.5,color:"rgba(244,237,216,.8)",zIndex:100,boxShadow:"0 8px 24px rgba(0,0,0,.5)",textAlign:"left",fontFamily:"system-ui,sans-serif",fontStyle:"normal",letterSpacing:0,textTransform:"none"}}>This is an estimated guess that compares the skills and experience in your profile to this job's listed requirements. It's a rough guide only — a lower score doesn't mean you shouldn't apply, and a high score isn't a guarantee. Use it as one signal among many.</div>}
      {match?<>
        <div style={{fontSize:mobile?17:20,fontWeight:800,color:scoreColor,fontFamily:"'Cinzel',serif",lineHeight:1}}>{match.score.toFixed(1)}</div>
        <div style={{fontSize:8,color:scoreColor,opacity:.7,fontFamily:"'Cinzel',serif",letterSpacing:.3}}>/ 10</div>
        <div style={{fontSize:7,color:"rgba(244,237,216,.4)",textTransform:"uppercase",letterSpacing:.5,marginTop:1}}>Match</div>
      </>:<>
        <div style={{fontSize:mobile?17:20,fontWeight:800,color:"rgba(244,237,216,.3)",fontFamily:"'Cinzel',serif",lineHeight:1}}>—</div>
        <div style={{fontSize:7,color:"rgba(201,168,76,.6)",textAlign:"center",lineHeight:1.25,marginTop:2,padding:"0 1px"}}>Fill out your profile for a match score</div>
      </>}
    </div>}
    </div>
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
  const [expanded,setExpanded]=useState(()=>{
    try{ const s=sessionStorage.getItem("mq_expanded"); return s?JSON.parse(s):{}; }catch{ return {}; }
  });
  useEffect(()=>{ try{ sessionStorage.setItem("mq_expanded",JSON.stringify(expanded)); }catch{} },[expanded]);
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
    const entries=Object.entries(ATS_STUDIOS);
    const BATCH=5;
    for(let i=0;i<entries.length;i+=BATCH){
      if(signal.aborted)break;
      const batch=entries.slice(i,i+BATCH);
      await Promise.all(batch.map(async([companyName,{platform,slug}])=>{
        let company=null,stateKey="";
        for(const[,states] of Object.entries(COMPANIES_DATA)){
          for(const[state,companies] of Object.entries(states)){
            const found=companies.find(c=>c.name===companyName);
            if(found){company=found;stateKey=state;break;}
          }
          if(company)break;
        }
        // If the studio isn't in COMPANIES_DATA, still fetch but with a minimal company object
        if(!company){company={name:companyName,url:"",email:null};stateKey="Remote";}
        try{
          const res=await fetch(`/api/jobs/ats?platform=${platform}&slug=${encodeURIComponent(slug)}`,{signal});
          if(!res.ok){if(!signal.aborted)setLiveJobs(prev=>({...prev,[companyName]:null}));return;}
          const data=await res.json();
          const jobs=(data.jobs||[]).map(j=>normalizeATSJob(j,platform,company,stateKey));
          if(!signal.aborted)setLiveJobs(prev=>({...prev,[companyName]:jobs.length>0?jobs:null}));
        }catch{if(!signal.aborted)setLiveJobs(prev=>({...prev,[companyName]:null}));}
      }));
      if(!signal.aborted)await new Promise(r=>setTimeout(r,250));
    }
    if(!signal.aborted)setLiveStatus("done");
  };

  useEffect(()=>{ const t=setTimeout(fetchLiveJobs,2000); return()=>{clearTimeout(t);abortRef.current?.abort();}; },[]);

  const getDisplayJobs=(name,gen)=>{
    const live=liveJobs[name];
    // Live ATS jobs take priority. gen only ever contains real volunteer-override jobs now.
    if(Array.isArray(live)&&live.length>0) return [...live,...(gen||[])];
    return gen||[]; // volunteer overrides (if any), else empty — never fake jobs
  };
  const [appliedSort,setAppliedSort]=useState("date-desc");
  const [filters,setFilters]=useState({countries:[],states:[],titles:[],experience:[],remote:[],types:[],search:"",newOnly:false,activeOnly:false,emailApplyOnly:false,minMatch:0,dateFrom:""});
  const [filterOpen,setFilterOpen]=useState(false);
  const refreshTimer=useRef(null);

  useEffect(()=>{refreshTimer.current=setInterval(()=>setLastRefresh(new Date()),300000);return()=>clearInterval(refreshTimer.current);},[]);

  const login=u=>setUser(u);
  const logout = async () => { await supabase.auth.signOut(); setUser(null); setShowAcct(false); };
  const updateUser=u=>setUser(u);

  // Restore session on mount so refreshing the page doesn't log the user out.
  const [authChecked,setAuthChecked]=useState(false);
  useEffect(()=>{
    let active=true;
    (async()=>{
      try{
        const { data:{ session } }=await supabase.auth.getSession();
        // Respect "stay signed in": if they opted out and the browser was fully closed
        // (sessionStorage cleared) then end the session instead of restoring it.
        let stay=true;
        try{ stay=localStorage.getItem("mq_stay")==="1"||sessionStorage.getItem("mq_session")==="1"; }catch{}
        if(session?.user&&!stay){ try{await supabase.auth.signOut();}catch{} if(active)setAuthChecked(true); return; }
        if(session?.user&&active){
          const uid=session.user.id, em=session.user.email;
          let profile=null, applied={};
          try{ const { data }=await supabase.from("profiles").select("*").eq("id",uid).single(); profile=data; }catch{}
          try{
            const { data:apps }=await supabase.from("applications").select("*").eq("user_id",uid);
            (apps||[]).forEach(a=>{ applied[a.job_id]={ date:a.applied_at }; });
          }catch{}
          const profData=(profile&&profile.data)?profile.data:(profile||{});
          if(active)setUser({ id:uid, email:em, name:profile?.name||profData.name||em, applied, profile:profData });
        }
      }catch{}
      if(active)setAuthChecked(true);
    })();
    return ()=>{active=false;};
  },[]);

  const markApplied = async (jobId) => {
    setUser(prev => ({ ...prev, applied: { ...prev.applied, [jobId]: { date: new Date().toISOString() } } }));
    const job = Object.values(ALL_JOBS_DATA).flatMap(s => Object.values(s).flatMap(c => Object.values(c).flatMap(co => co.jobs))).find(j => j.id === jobId);
    if (!user?.id || !job) return;
    await supabase.from("applications").upsert({ user_id: user.id, job_id: jobId, job_title: job.title, company: job.company, job_url: job.url, salary: job.salary, applied_at: new Date().toISOString() }, { onConflict: "user_id,job_id" });
  };

  // Toggle per-company job-post notifications (stored in profile.notifyCompanies)
  const toggleNotify = async (companyName) => {
    setUser(prev => {
      const cur = prev?.profile?.notifyCompanies || [];
      const next = cur.includes(companyName) ? cur.filter(c => c !== companyName) : [...cur, companyName];
      const newProfile = { ...(prev?.profile||{}), notifyCompanies: next };
      if (prev?.id) { supabase.from("profiles").upsert({ id: prev.id, name: prev.name, data: newProfile }, { onConflict: "id" }).then(()=>{}); }
      return { ...prev, profile: newProfile };
    });
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
    if(f.emailApplyOnly&&!job.isEmailApply)return false;
    if(f.minMatch>0){const ms=computeMatchScore(job,user?.profile)?.score??-1;if(ms<f.minMatch)return false;}
    if(f.search){const q=f.search.toLowerCase();if(!job.title.toLowerCase().includes(q)&&!job.company.toLowerCase().includes(q))return false;}
    return true;
  };

  const sortJobs=jobs=>jobs.slice().sort((a,b)=>{
    if(jobSort==="match"){
      const sa=computeMatchScore(a,user?.profile)?.score??-1;
      const sb=computeMatchScore(b,user?.profile)?.score??-1;
      return sb-sa;
    }
    if(jobSort==="newest")return new Date(b.posted)-new Date(a.posted);
    if(jobSort==="oldest")return new Date(a.posted)-new Date(b.posted);
    if(jobSort==="title")return a.title.localeCompare(b.title);
    return 0;
  });

  const allCountries=Object.keys(ALL_JOBS_DATA);
  const allStates=[...new Set(Object.values(ALL_JOBS_DATA).flatMap(s=>Object.keys(s)))].sort();
  const allTitles=JOB_CATS.slice().sort();
  const hasAnyFilter=filters.titles.length>0||(filters.experience?.length||0)>0||filters.remote.length>0||filters.types.length>0||filters.dateFrom||filters.newOnly||filters.activeOnly||filters.emailApplyOnly||filters.minMatch>0||!!filters.search;
  const activeCount=filters.countries.length+filters.states.length+filters.titles.length+(filters.experience?.length||0)+filters.remote.length+filters.types.length+(filters.dateFrom?1:0)+(filters.newOnly?1:0)+(filters.activeOnly?1:0)+(filters.emailApplyOnly?1:0)+(filters.minMatch>0?1:0);
  const CLEAR={countries:[],states:[],titles:[],experience:[],remote:[],types:[],search:"",newOnly:false,activeOnly:false,emailApplyOnly:false,minMatch:0,dateFrom:""};

  // All jobs flat list for stats
  const allJobs=Object.values(ALL_JOBS_DATA).flatMap(s=>Object.values(s).flatMap(c=>Object.entries(c).flatMap(([nm,co])=>getDisplayJobs(nm,co.jobs))));
  const totalJobs=allJobs.filter(matches).length;
  const newJobs=allJobs.filter(j=>j.isNew&&matches(j)).length;
  const totalCos=Object.values(ALL_JOBS_DATA).flatMap(s=>Object.values(s).flatMap(c=>Object.keys(c))).length;
  const appliedJobs=allJobs.filter(j=>user?.applied?.[j.id]);

  if(!user){
    if(!authChecked)return <div style={{minHeight:"100vh",background:"#080608",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"#c9a84c",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:1}}>⚔️ Loading…</div></div>;
    return <Auth onLogin={login}/>;
  }

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
    <div style={{minHeight:"100vh",background:"#080608",color:"#f4edd8",fontFamily:"'Space Grotesk',sans-serif",position:"relative",overflowX:"hidden",display:"flex",flexDirection:"column"}}>
    {/* Styles */}
    <style>{`*{box-sizing:border-box;margin:0;padding:0;}:root{color-scheme:dark;}html{color-scheme:dark;}body{background:#080608!important;color-scheme:dark;-webkit-text-size-adjust:100%;}@keyframes ob1{0%,100%{transform:translate(0,0)}50%{transform:translate(50px,-30px)}}@keyframes ob2{0%,100%{transform:translate(0,0)}50%{transform:translate(-60px,30px)}}@keyframes ob3{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-50px)}}@keyframes pnew{0%,100%{box-shadow:0 0 0 0 rgba(192,50,26,.5)}50%{box-shadow:0 0 0 5px rgba(192,50,26,0)}}input,select,textarea{font-size:16px!important;}input:focus,select:focus,textarea:focus{outline:none;border-color:#c9a84c!important;box-shadow:0 0 0 2px rgba(201,168,76,.15);}::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(201,168,76,.2);border-radius:3px;}button{-webkit-tap-highlight-color:transparent;}@media(max-width:640px){.hide-mobile{display:none!important;}}`}</style>
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

    <main style={{position:"relative",zIndex:1,maxWidth:1100,width:"100%",margin:"0 auto",padding:mobile?"14px 12px":"24px 18px",flex:1}}>
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
              <label onClick={()=>setFilters(f=>({...f,activeOnly:!f.activeOnly}))} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",userSelect:"none",marginTop:8}}>
                <div style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${filters.activeOnly?"#c9a84c":"rgba(201,168,76,.25)"}`,background:filters.activeOnly?"#c9a84c":"rgba(201,168,76,.04)",display:"flex",alignItems:"center",justifyContent:"center"}}>{filters.activeOnly&&<I.Check s={9} c="#0a0608"/>}</div>
                <span style={{fontSize:11,color:"rgba(244,237,216,.65)"}}>Active Listings Only</span>
              </label>
              <label onClick={()=>setFilters(f=>({...f,emailApplyOnly:!f.emailApplyOnly}))} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",userSelect:"none",marginTop:8}}>
                <div style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${filters.emailApplyOnly?"#c9a84c":"rgba(201,168,76,.25)"}`,background:filters.emailApplyOnly?"#c9a84c":"rgba(201,168,76,.04)",display:"flex",alignItems:"center",justifyContent:"center"}}>{filters.emailApplyOnly&&<I.Check s={9} c="#0a0608"/>}</div>
                <span style={{fontSize:11,color:"rgba(244,237,216,.65)"}}>Email Apply Only</span>
              </label>
            </FSection>
            <FSection title="Minimum Match Score" count={filters.minMatch>0?1:0}>
              <p style={{fontSize:10.5,color:"rgba(244,237,216,.4)",marginBottom:8,lineHeight:1.4,fontStyle:"italic"}}>Show only jobs at or above this match score. Requires skills/resume in your profile.</p>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <input type="range" min={0} max={9} step={0.5} value={filters.minMatch} onChange={e=>setFilters(f=>({...f,minMatch:parseFloat(e.target.value)}))} style={{flex:1,accentColor:"#c9a84c",cursor:"pointer"}}/>
                <span style={{fontSize:13,fontWeight:800,color:filters.minMatch>0?"#c9a84c":"rgba(244,237,216,.4)",fontFamily:"'Cinzel',serif",minWidth:46,textAlign:"right"}}>{filters.minMatch>0?`${filters.minMatch.toFixed(1)}+`:"Any"}</span>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[["Any",0],["5+",5],["7+",7],["8+",8]].map(([lbl,val])=><button key={lbl} onClick={()=>setFilters(f=>({...f,minMatch:val}))} style={{background:filters.minMatch===val?"rgba(201,168,76,.2)":"rgba(201,168,76,.05)",border:`1px solid ${filters.minMatch===val?"rgba(201,168,76,.4)":"rgba(201,168,76,.12)"}`,color:filters.minMatch===val?"#f0d080":"rgba(244,237,216,.45)",cursor:"pointer",borderRadius:6,fontSize:10,padding:"4px 11px",fontFamily:"'Cinzel',serif",fontWeight:700}}>{lbl}</button>)}
              </div>
            </FSection>
          </div>}
        </div>
        {/* Sort bar */}
        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",padding:mobile?"7px 10px":"8px 12px",background:"rgba(201,168,76,.03)",border:"1px solid rgba(201,168,76,.08)",borderRadius:10,marginBottom:12}}>
          <span style={{fontSize:9,color:"rgba(201,168,76,.6)",fontFamily:"'Cinzel',serif",textTransform:"uppercase",letterSpacing:.8,marginRight:2}}>Sort:</span>
          {sortChip("default","Default")}{sortChip("match","Best Match")}{sortChip("newest","Newest")}{sortChip("oldest","Oldest")}{!mobile&&sortChip("title","Title A–Z")}
        </div>
        {/* Job tree */}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {Object.entries(ALL_JOBS_DATA)
            .filter(([country])=>filters.countries.length===0||filters.countries.includes(country))
            .map(([country,states])=>{
              const cKey=`c-${country}`;
              const cAllJobs=Object.values(states).flatMap(cos=>Object.entries(cos).flatMap(([nm,co])=>getDisplayJobs(nm,co.jobs)));
              const cNewJobs=cAllJobs.some(j=>j.isNew&&matches(j));
              const cTotal=cAllJobs.filter(matches).length;
              // Hide country if a filter is active and nothing inside matches
              if(hasAnyFilter){
                const anyCoName=filters.search&&Object.values(states).some(cos=>Object.keys(cos).some(n=>n.toLowerCase().includes(filters.search.toLowerCase())));
                const anyEmail=filters.emailApplyOnly&&Object.values(states).some(cos=>Object.values(cos).some(co=>co.emailApply));
                const volOnly=filters.types.length===1&&filters.types[0]==="Volunteer";
                const anyVol=volOnly&&Object.values(states).some(cos=>Object.values(cos).some(co=>co.volunteer));
                if(cTotal===0&&!anyCoName&&!anyEmail&&!anyVol)return null;
              }
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
                      const sAllJobs=Object.entries(companies).flatMap(([nm,co])=>getDisplayJobs(nm,co.jobs));
                      const sTotal=sAllJobs.filter(matches).length;
                      const sNewJobs=sAllJobs.some(j=>j.isNew&&matches(j));
                      // Count companies that survive the active filters
                      const sCompaniesShown=Object.entries(companies).filter(([nm,co])=>{
                        if(!hasAnyFilter)return true;
                        const dj=getDisplayJobs(nm,co.jobs);
                        if(filters.activeOnly&&dj.length===0)return false;
                        if(filters.emailApplyOnly&&!co.emailApply&&!dj.some(j=>j.isEmailApply))return false;
                        if(filters.types.length===1&&filters.types[0]==="Volunteer"&&(co.volunteer||dj.some(j=>j.isVolunteer||j.type==="Volunteer")))return true;
                        if(filters.search){const q=filters.search.toLowerCase();if(nm.toLowerCase().includes(q))return true;}
                        const jlf=filters.titles.length>0||(filters.experience?.length||0)>0||filters.remote.length>0||filters.types.length>0||filters.dateFrom||filters.newOnly||filters.minMatch>0;
                        if(!jlf)return true;
                        return dj.some(j=>matches(j));
                      }).length;
                      // Hide this state entirely if a filter is active and nothing in it matches
                      if(hasAnyFilter&&sCompaniesShown===0)return null;
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
                              // Active Listings Only: company must have at least one real job
                              if(filters.activeOnly&&displayJobs.length===0)return false;
                              // Email Apply Only: company must have an email-apply job (or be flagged emailApply)
                              if(filters.emailApplyOnly&&!company.emailApply&&!displayJobs.some(j=>j.isEmailApply))return false;
                              // Volunteer type filter: show companies flagged volunteer even with no listings
                              const volunteerFilterOnly=filters.types.length===1&&filters.types[0]==="Volunteer";
                              if(volunteerFilterOnly&&(company.volunteer||displayJobs.some(j=>j.isVolunteer||j.type==="Volunteer")))return true;
                              if(filters.search){const q=filters.search.toLowerCase();if(name.toLowerCase().includes(q))return true;}
                              // If only company-level filters are active (no job-level filters), show the company
                              const jobLevelFilters=filters.titles.length>0||(filters.experience?.length||0)>0||filters.remote.length>0||filters.types.length>0||filters.dateFrom||filters.newOnly||filters.minMatch>0;
                              if(!jobLevelFilters)return true;
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
                                  <span style={{fontWeight:500}}>{name}</span>
                                  {user&&(()=>{const isOn=(user.profile?.notifyCompanies||[]).includes(name);return <span onClick={e=>{e.stopPropagation();toggleNotify(name);}} title={isOn?"Notifications on — click to turn off":"Turn on job post notifications for this company"} style={{display:"inline-flex",alignItems:"center",cursor:"pointer",marginLeft:6,position:"relative",opacity:isOn?1:.5,transition:"opacity .15s"}} onMouseEnter={e=>{e.currentTarget.style.opacity=1;const tip=e.currentTarget.querySelector(".belltip");if(tip)tip.style.opacity=1;}} onMouseLeave={e=>{e.currentTarget.style.opacity=isOn?1:.5;const tip=e.currentTarget.querySelector(".belltip");if(tip)tip.style.opacity=0;}}><I.Bell s={13} c={isOn?"#c9a84c":"rgba(244,237,216,.6)"} fill={isOn?"#c9a84c":"none"}/><span className="belltip" style={{position:"absolute",bottom:"130%",left:"50%",transform:"translateX(-50%)",background:"rgba(20,14,10,.98)",border:"1px solid rgba(201,168,76,.3)",color:"rgba(244,237,216,.85)",fontSize:10,lineHeight:1.3,padding:"5px 8px",borderRadius:6,width:150,textAlign:"center",opacity:0,transition:"opacity .15s",pointerEvents:"none",zIndex:60,fontFamily:"system-ui,sans-serif",fontWeight:400}}>{isOn?"Notifications on for this company":"Turn on job post notifications for this company"}</span></span>;})()}
                                  <span style={{flex:1}}/>
                                  {hasNew&&<span style={{width:14,height:14,borderRadius:"50%",background:"#c0321a",display:"flex",alignItems:"center",justifyContent:"center",animation:"pnew 1.5s ease-in-out infinite"}}><I.Alert s={12}/></span>}
                                  {(company.volunteer||fJobs.some(j=>j.isVolunteer||j.type==="Volunteer"))&&<span style={{fontSize:9,color:"#7ecfb3",background:"rgba(126,207,179,.12)",border:"1px solid rgba(126,207,179,.3)",padding:"1px 7px",borderRadius:20,fontFamily:"'Cinzel',serif",fontWeight:700,marginRight:5}}>Volunteer</span>}
                                  {(company.emailApply)&&<span style={{fontSize:9,color:"#e8a070",background:"rgba(232,97,58,.1)",border:"1px solid rgba(232,97,58,.3)",padding:"1px 7px",borderRadius:20,fontFamily:"'Cinzel',serif",fontWeight:700,marginRight:5}}>Email Apply</span>}
                                  {isLive&&<span style={{background:"rgba(126,207,179,.12)",border:"1px solid rgba(126,207,179,.3)",color:"#7ecfb3",borderRadius:20,fontSize:8,padding:"1px 6px",fontWeight:700,marginRight:3}}>● Live</span>}<span style={{fontSize:9,color:"rgba(244,237,216,.35)",background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.1)",padding:"1px 7px",borderRadius:20,fontStyle:noJobs?"italic":"normal"}}>{(()=>{const hasSource=!!ATS_STUDIOS[name];const isLoading=liveJobs[name]===undefined&&hasSource;return isLoading?"Checking…":noJobs?"No openings":`${fJobs.length} opening${fJobs.length!==1?"s":""}`;})()}</span>
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
    {/* Legal footer */}
    <footer style={{borderTop:"1px solid rgba(201,168,76,.12)",padding:"20px 24px",marginTop:0,display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:12,background:"rgba(8,6,8,.6)",position:"relative",zIndex:1,flexShrink:0}}>
      <div style={{fontSize:11,color:"rgba(244,237,216,.35)",lineHeight:1.5,maxWidth:560}}>
        Main Quest aggregates publicly available job listings and is not affiliated with any studio listed. Job data may be inaccurate — always verify on the employer's official site. Trademarks belong to their respective owners.
      </div>
      <div style={{display:"flex",gap:16,alignItems:"center",flexShrink:0}}>
        <a href="/privacy" style={{fontSize:11,color:"#c9a84c",textDecoration:"none",fontFamily:"'Cinzel',serif"}}>Privacy Policy</a>
        <a href="/terms" style={{fontSize:11,color:"#c9a84c",textDecoration:"none",fontFamily:"'Cinzel',serif"}}>Terms of Service</a>
        <span style={{fontSize:11,color:"rgba(244,237,216,.25)"}}>© 2026 Main Quest</span>
      </div>
    </footer>
    {/* Terms update notice — shows if the user agreed to an older version */}
    {user&&user.profile&&user.profile.tosVersion&&user.profile.tosVersion!==TOS_VERSION&&<div style={{position:"sticky",bottom:0,zIndex:50,background:"rgba(20,14,10,.98)",borderTop:"2px solid rgba(201,168,76,.4)",padding:"14px 24px",display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"center",gap:14,boxShadow:"0 -8px 30px rgba(0,0,0,.5)"}}>
      <span style={{fontSize:13,color:"#f4edd8",lineHeight:1.5,textAlign:"center"}}>📜 Our <a href="/terms" target="_blank" style={{color:"#c9a84c"}}>Terms of Service</a> and <a href="/privacy" target="_blank" style={{color:"#c9a84c"}}>Privacy Policy</a> have been updated. Please review and agree to continue.</span>
      <button onClick={async()=>{const np={...user.profile,tosVersion:TOS_VERSION};setUser(u=>({...u,profile:np}));if(user?.id){try{await supabase.from("profiles").upsert({id:user.id,name:user.name,data:np},{onConflict:"id"});}catch(e){console.error(e);}}}} style={{background:G,border:"none",color:"#0a0608",cursor:"pointer",borderRadius:8,padding:"8px 22px",fontSize:12,fontWeight:800,fontFamily:"'Cinzel',serif",letterSpacing:.5,flexShrink:0}}>I Agree</button>
    </div>}
  </div>
  </>;
}