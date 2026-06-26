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
      { name: "Wolfpack Game Design", url: "https://www.wolfpackgamedesign.com/join-us", email: "community@wolfpackgamedesign.com", contact: null, volunteer:true },
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
      { name: "IllFonic", url: "https://illfonic.breezy.hr/", email: null, contact: "https://www.illfonic.com/contact" },
      { name: "Monster Theater Games", url: "https://docs.google.com/forms/d/e/1FAIpQLScssViQlK9BDwHw__PXeuQudF-kNA8lWarTuDlLGapX01XpYQ/viewform", email: "contact@monstertheater.games", contact: null },
      { name: "Operative Games", url: "https://www.operativegames.ai/careers/", email: null, contact: "https://www.operativegames.ai/contact-us/" },
      { name: "Pavonis Interactive", url: "https://www.pavonisinteractive.com/jobs.htm", email: "outreach@pavonisinteractive.com", contact: "https://www.pavonisinteractive.com/contact.htm" },
      { name: "Serenity Forge", url: "https://www.serenityforge.com/careers", email: "jobs@serenityforge.com", contact: null },
    ],
    "Connecticut": [
      { name: "Fire Fly Studios", url: "https://fireflyworlds.com/careers/", email: null, contact: "https://firefly-studios.helpshift.com/hc/en/3-firefly-studios/contact-us/" },
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
      { name: "Good Dog Studios", url: "https://www.gooddogstudios.com/careers", email: "contact@gooddogstudios.com", contact: "https://www.gooddogstudios.com/contact" },
      { name: "Greatsword Game Studio", url: "https://www.greatswordgames.com/careers", email: "greatswordstudios@gmail.com", contact: null , volunteer:true },
      { name: "Grove Street Games", url: "https://grovestreetgames.com/careers/", email: "jobs@grovestreetgames.com ", contact: null },
      { name: "Helm Systems", url: "https://www.helmsystems.com/copy-of-about-1", email: null, contact: null },
      { name: "Magic Find Studios", url: "https://www.magicfindstudios.com", email: null, contact: null },
      { name: "Motorsport Games", url: "https://motorsportgames.bamboohr.com/careers", email: null, contact: null },
      { name: "Shiver Entertainment", url: "https://www.shiver.net", email: "cvs@shiver.net", contact: null , emailApply:true },
      { name: "Sword and Wand", url: "https://swordandwand.com/careers", email: "careers@swordandwand.com", contact: "https://swordandwand.com/contact" },
      { name: "Studio Wildcard", url: "https://www.studiowildcard.com/jobs", email: null, contact: null },
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
      { name: "Tripwire Interactive", url: "https://tripwireinteractive.com/#/careers", email: null, contact: "https://tripwireinteractive.com/#/company" },
    ],
    "Idaho": [
      { name: "Curious Media", url: "https://www.curiousmedia.com/careers/", email: "jobs@curiousmedia.com", contact: "info@curiousmedia.com" , emailApply:true },
      { name: "Mighty Coconut", url: "https://www.mightycoconut.com/jobs", email: "jobs@mightycoconut.com", contact: null },
    ],
    "Illinois": [
      { name: "Everi", url: "https://www.everi.com/careers-culture/", email: null, contact: "https://www.everi.com/contact/" },
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
      { name: "Bully Entertainment", url: "https://bullyentertainment.com/careers/", email: null, contact: "https://bullyentertainment.com/contact/" },
      { name: "Exis Interactive", url: "https://www.exisinteractive.com/", email: null, contact: null },
      { name: "Firaxis", url: "https://www.firaxis.com/", email: null, contact: null },
      { name: "Midsummer Studios", url: "https://job-boards.greenhouse.io/midsummerstudios", email: null, contact: "https://www.midsummerstudios.com/contact" },
      { name: "Mohawk Games", url: "https://mohawkgames.com/jobs/", email: null, contact: null },
      { name: "Oxide Games", url: "https://www.oxidegames.com/careers/jobs/", email: null, contact: "https://www.oxidegames.com/contact/" },
      { name: "Pure Bang", url: "http://purebang.com/jobs-at-pure-bang/", email: "jobs@purebang.com", contact: null },
      { name: "Starcaster Games", url: "https://starcaster.games/partners/", email: null, contact: null },
      { name: "ZeniMax", url: "https://www.zenimax.com/en", email: null, contact: null },
    ],
    "Massachusetts": [
      { name: "Camlann Games", url: "https://camlanngames.com/", email: null, contact: "https://camlanngames.com/contact/" },
      { name: "CD Projekt Red", url: "https://www.cdprojektred.com/en/jobs", email: null, contact: null },
      { name: "Crate Entertainment", url: "https://www.crateentertainment.com/nojobs/", email: "jobs@crateentertainment.com", contact: "https://www.crateentertainment.com/contact/" },
      { name: "Cryptyd Games", url: "https://cryptydgames.com/join-us/", email: "a.alaa@cryptydgames.com", contact: "https://cryptydgames.com/contact-us/" },
      { name: "Decoy Games", url: "https://www.decoygames.com/", email: "general@decoygames.com", contact: null },
      { name: "Deep End Games", url: "https://www.thedeependgames.com/", email: "jobs@thedeependgames.com", contact: null },
      { name: "Demiurge", url: "https://demiurgestudios.com/job-openings/", email: null, contact: null },
      { name: "Fable Vision Studios", url: "https://www.fablevisionstudios.com/careers", email: null, contact: "https://www.fablevisionstudios.com/contact-us" },
      { name: "Firehose Games", url: "https://www.firehosegames.com/", email: null, contact: "https://www.firehosegames.com/contact-us/" },
      { name: "First Break Labs", url: "http://firstbreaklabs.com/", email: null, contact: "contact@firstbreaklabs.com" },
      { name: "Ghost Story Games", url: "https://job-boards.greenhouse.io/gsgcareers", email: "community@ghoststorygames.com", contact: "https://www.ghoststorygames.com/contact" },
      { name: "Harmonix", url: "https://www.harmonixmusic.com/about/jobs", email: null, contact: null },
      { name: "Otherside Entertainment", url: "https://careers.otherside-e.com/jobs", email: null, contact: "https://otherside-e.com/contact-us/" },
      { name: "Outact", url: "https://www.outact.com/", email: "jobs@outact.net", contact: "https://www.outact.com/#contact" },
      { name: "Skymap", url: "https://www.useparallel.com/skymapgames/careers", email: null, contact: "https://skymap.com/contact" },
      { name: "Storm Flag Games", url: "https://stormflag.games/join", email: "hiring@stormflaggames.com", contact: "https://stormflag.games/contact" },
      { name: "Terrible Posture Games", url: "https://www.terribleposture.com/careers/", email: null, contact: "https://www.terribleposture.com/contact/" },
      { name: "Warner Bros.", url: "https://careers.wbd.com/global/en/wb-games-jobs", email: null, contact: null },
      { name: "Zapdot", url: "https://www.zapdot.com/", email: "hello@zapdot.com", contact: null },
      { name: "Zephyr Workshop", url: "https://zephyrworkshop.com/blowusaway/", email: "zephyrworkshop@gmail.com", contact: null },
    ],
    "Michigan": [
      { name: "Plarium", url: "https://company.plarium.com/en/career/", email: "talents@plarium.com", contact: null },
      { name: "Stardock", url: "https://www.stardock.com/careers", email: null, contact: "https://www.stardock.com/about/contact" },
      { name: "You Pass Universe", url: "https://www.ypuniverse.com/career", email: null, contact: null },
    ],
    "Minnesota": [
      { name: "Drattzy Games", url: "https://alteriumshift.com/", email: null, contact: null },
      { name: "King Show Games", url: "https://www.ksg.com/careers", email: "careers@ksg.com", contact: "https://www.ksg.com/contact" },
      { name: "Napnok Games", url: "https://napnokgames.com/all-jobs/", email: "jobs@napnokgames.com", contact: null },
    ],
    "Missouri": [
      { name: "Mob Entertainment", url: "https://job-boards.greenhouse.io/MobEntertainment", email: "info@mobentertainment.com", contact: "https://www.mobentertainment.com/contact" },
    ],
    "New Hampshire": [
      { name: "Virtual Basement", url: "https://virtualbasement.com/#", email: null, contact: "https://virtualbasement.com/contact-us/" },
    ],
    "New Jersey": [
      { name: "High 5 Games", url: "https://high5games.bamboohr.com/careers", email: null, contact: "https://high5games.com/about/contact-us/" },
      { name: "Kalypso Media", url: "https://jobs.kalypsomedia.com/en", email: null, contact: "https://www.kalypsomedia.com/contact?" },
      { name: "N Fusion", url: "https://www.n-fusion.com/", email: "jobs@n-fusion.com", contact: "https://www.n-fusion.com/contact/" },
      { name: "Saber Interactive", url: "https://saber.games/careers/", email: null, contact: "https://saber.games/#contact" },
    ],
    "New York": [
      { name: "Amazon Game Studios", url: "https://amazon.jobs/content/en/teams/amazon-entertainment?cmpid=JB_YTAE200103B#jobs-search", email: null, contact: null },
      { name: "Atomic Theory(Rocket Science)", url: "https://www.rocketscience.gg/careers/", email: null, contact: "https://www.atomictheory.gg/contact/" },
      { name: "Avalanche Studios", url: "https://avalanchestudios.com/careers", email: null, contact: null },
      { name: "Blizzard Entertainment", url: "https://careers.blizzard.com/global/en", email: null, contact: null },
      { name: "Brass Lion Entertainment", url: "https://www.brasslionentertainment.com", email: null, contact: null },
      { name: "CI Games", url: "https://cigames.teamtailor.com/", email: null, contact: "https://cigames.com/en/contact/" },
      { name: "Darkwind Media", url: "https://www.darkwindmedia.com", email: null, contact: null },
      { name: "Experiment 7", url: "https://www.experiment7.com/careers", email: null, contact: "https://www.experiment7.com/contact" },
      { name: "Gameloft", url: "https://www.gameloft.com/jobs", email: null, contact: null },
      { name: "Half Mermaid", url: "https://halfmermaid.co/jobs", email: "jobs@halfmermaid.co", contact: "https://halfmermaid.co/contact" },
      { name: "Impeller Studios", url: "https://impellerstudios.com/careers/", email: null, contact: "https://impellerstudios.com/contact-impeller-studios/" },
      { name: "King", url: "https://www.king.com", email: null, contact: null },
      { name: "Liquid Swords", url: "https://careers.liquidswords.com/jobs", email: null, contact: null },
      { name: "Muse Games", url: "https://musegames.com/jobs/", email: "jobs@musegames.com", contact: "https://musegames.com/contact/" },
      { name: "People Can Fly", url: "https://careers.smartrecruiters.com/PeopleCanFly", email: null, contact: null },
      { name: "Riftweaver", url: "https://riftweaver.com", email: null, contact: null },
      { name: "Riot Games", url: "https://www.riotgames.com/en/work-with-us#job-list", email: null, contact: null },
      { name: "Rockstar", url: "https://www.rockstargames.com/careers/offices/rockstar-new-york", email: null, contact: null },
      { name: "Take-Two Interactive", url: "https://careers.take2games.com/jobs", email: null, contact: null },
      { name: "THQNordic", url: "https://thqnordic.com/company/careers", email: null, contact: "https://thqnordic.com/company/contact" },
      { name: "Top Hat Studios", url: "https://tophat.studio/careers.html", email: "careers@tophatentertainment.us", contact: "https://tophat.studio/contact.html" },
      { name: "Velan Studios", url: "https://www.velanstudios.com", email: null, contact: null },
      { name: "Wolfjaw Studios", url: "https://jobs.ashbyhq.com/wolfjaw-careers", email: null, contact: "https://wolfjawstudios.com/contact/" },
      { name: "Workin Man Interactive", url: "https://workinman.com", email: null, contact: null },
      { name: "Zynga", url: "https://www.zynga.com", email: null, contact: "https://www.zynga.com/about/contact-us" },
    ],
    "North Carolina": [
      { name: "Crater Studios", url: "https://craterstudiosgames.com/careers", email: "craterstudiosdevs@gmail.com", contact: "https://craterstudiosgames.com/contact" },
      { name: "Imangi", url: "https://imangistudios.com/careers/", email: null, contact: null },
      { name: "Methodical", url: "https://www.methodical.com/careers", email: null, contact: null },
      { name: "Studio Hermitage", url: "https://careers.studio-hermitage.com/jobs", email: null, contact: null },
      { name: "Third Pie Studios", url: "https://thirdpiestudios.com/careers", email: null, contact: "https://thirdpiestudios.com/contact-us" },
      { name: "Vavel Games", url: "https://careers.vavel.gs/", email: "jobs@vavel.gs", contact: "https://vavel.gs/contact/" },
      { name: "WDR Studios", url: "https://www.wdrstudios.com/careers", email: "team@wdrstudios.com", contact: null },
      { name: "Zapper Games", url: "https://jobs.zapper.games/jobs", email: null, contact: "https://jobs.zapper.games/connect" },
    ],
    "Ohio": [
      { name: "Square Table Games", url: "https://www.soulspires.com/", email: "stgamestudios@gmail.com", contact: null },
    ],
    "Oregon": [
      { name: "Brainum", url: "hhttps://brainium.com/careers/#open-roles", email: null, contact: null },
      { name: "Nightdive Studios", url: "https://job-boards.greenhouse.io/nightdivestudios", email: null, contact: "https://nightdivestudios.com/support/" },
      { name: "Pipeworks", url: "https://pipeworks.pinpointhq.com/", email: null, contact: "https://www.pipeworks.com/contact/" },
      { name: "Bend Studio", url: "https://www.bendstudio.com/careers", email: "BendStudio@Sony.com", contact: null },
      { name: "Wicked Saints Studio", url: "https://www.wickedsaints.studio/hiring", email: null, contact: "https://www.wickedsaints.studio/contact" },
    ],
    "Pennsylvania": [
      { name: "Bigger Boss Games", url: "https://www.biggerbossgames.com/", email: null, contact: "https://www.biggerbossgames.com/contact" },
      { name: "Dynasty Studios", url: "https://dynastystudios.io/careers", email: null, contact: "https://dynastystudios.io/contact" },
      { name: "Mega Cat Studios", url: "https://megacatstudios.com/pages/jobs", email: "sir.meowface@megacatstudios.com", contact: null },
      { name: "Schell Games", url: "https://schellgames.com/careers#apply", email: "info@schellgames.com", contact: "https://schellgames.com/contact" },
    ],
    "Remote": [
      { name: "Cire Games", url: "https://ciregames.com/Careers/", email: null, contact: "https://ciregames.com/Contacts/" },
      { name: "Farbridge", url: "https://farbridge.com/careers", email: "hello@farbridge.com", contact: "https://farbridge.com/contact" },
      { name: "Fortis Games", url: "https://www.fortisgames.com/en-us/careers#openings", email: null, contact: null },
      { name: "Squanch Games", url: "https://squanchgames.com/jobs/", email: "workwithus@squanchgames.com", contact: "https://squanchgames.com/contact/" },
      { name: "Thought Pennies", url: "https://thought-pennies.careers-page.com/", email: null, contact: null },
      { name: "ZeniMax Online Studios", url: "https://www.zenimaxonline.com/en-us/careers", email: "jobs@zenimaxonline.com", contact: null },
    ],
    "Rhode Island": [
      { name: "Orion Games", url: "https://oriongames.net/jobs/", email: null, contact: "https://oriongames.net/contact-us/" },
      { name: "Unleashed Games", url: "https://www.unleashedgames.com/", email: null, contact: null },
    ],
    "Tennessee": [
      { name: "Traega Entertainment", url: "https://www.traega.com/", email: "jobs@traega.com", contact: null },
      { name: "Turning Wheel Games", url: "https://www.turningwheelgames.com/#careers", email: "careers@turningwheelgames.com", contact: null },
    ],
    "Texas": [
      { name: "Ares Interactive", url: "https://aresinteractive.com/careers/", email: null, contact: null },
      { name: "Avore", url: "https://arvore.io/work-with-us", email: "contact@arvore.io", contact: "https://arvore.io/contact" },
      { name: "Aspyr", url: "https://aspyr.com/open_positions", email: null, contact: "https://aspyr.com/contact" },
      { name: "Astro Beam", url: "https://www.astrobeam.com/jobs", email: "jobs@astrobeam.com", contact: "https://www.astrobeam.com/home#contact-us" },
      { name: "Atomic Theory", url: "https://www.rocketscience.gg/careers/", email: null, contact: "https://www.atomictheory.gg/contact/" },
      { name: "BioWare", url: "https://www.bioware.com/careers/#current-openings", email: null, contact: null },
      { name: "Blind Squirrel Games", url: "https://blindsquirrelentertainment.com/careers", email: "careers@blindsquirrelgames.com", contact: null },
      { name: "Boss Fight Entertainment", url: "https://www.bossfightentertainment.com/careers", email: "info@bossfightentertainment.com", contact: null },
      { name: "C Prompt Games", url: "https://www.cpromptgames.com/careers", email: null, contact: "https://www.cpromptgames.com/contact-us" },
      { name: "Cards and Tankards", url: "https://cardsandtankards.com/careers", email: "support@divergent-realities.com", contact: null },
      { name: "Cat Face", url: "https://www.catface.com/careers", email: null, contact: null },
      { name: "Certain Affinity", url: "https://www.certainaffinity.com/careers/", email: null, contact: "null" },
      { name: "Cloud Imperium Games", url: "https://cloudimperiumgames.com/join-us/studio/atx#open-positions", email: null, contact: null },
      { name: "Cooldown Games", url: "https://cooldowngames.com/careers/", email: null, contact: "https://cooldowngames.com/contact/" },
      { name: "Crystal Dynamics", url: "https://www.crystaldynamics.com/careers/", email: null, contact: null },
      { name: "Daybreak Games", url: "https://www.daybreakgames.com/careers?locale=en_US", email: null, contact: null },
      { name: "Deadmage Games", url: "https://deadmage.com/#about-us", email: "info@deadmage.com", contact: "https://deadmage.com/#contact-us" },
      { name: "Devolver Digital", url: "https://www.devolverdigital.com/jobs", email: "fork@devolverdigital.com", contact: null },
      { name: "Dimensional Link", url: "https://www.dimensionalink.com/careers", email: null, contact: null },
      { name: "Elon’s Game & Arts", url: "https://www.elosgames.net/about-us", email: "info@elosgames.net", contact: null },
      { name: "Empty Vessel", url: "https://emptyvessel.io/jobs/", email: null, contact: "https://emptyvessel.io/contact/" },
      { name: "Enduring Games", url: "https://enduring.games/jobs/", email: "jobs@enduring.games", contact: "https://enduring.games/contact/" },
      { name: "Forward XP", url: "https://forwardxp.com/careers/#positions", email: "careers@forwardxp.com", contact: "https://forwardxp.com/contact-us/" },
      { name: "From the Future", url: "https://ftfvr.com/careers/", email: null, contact: "https://ftfvr.com/contact/" },
      { name: "Game Circus", url: "https://www.gamecircus.com/careers/", email: "info@gamecircus.com", contact: "https://www.gamecircus.com/contact/" },
      { name: "Game Salad", url: "https://gamesalad.com/jobs/", email: null, contact: "https://gamesalad.com/contact/" },
      { name: "Gearbox", url: "https://www.gearboxsoftware.com/careers/", email: "gamejobs@gearboxsoftware.com", contact: "https://2k.com/studios/gearbox/contact/" },
      { name: "Golf+", url: "https://www.golfplusvr.com/careers", email: null, contact: null },
      { name: "Groove Jones", url: "https://www.groovejones.com/workwithus", email: "whois@groovejones.com", contact: "https://www.groovejones.com/contact" },
      { name: "Gunfire Games", url: "https://gunfiregames.com/careers", email: null, contact: null },
      { name: "Hyper Beard", url: "https://hyperbeard.com/jobs/", email: null, contact: "https://hyperbeard.com/contact-us/" },
      { name: "ID Software", url: "https://www.idsoftware.com/en", email: null, contact: null },
      { name: "Infernozilla", url: "https://www.infernozilla.com/careers", email: "career@infernozilla.com", contact: "https://www.infernozilla.com/contact" },
      { name: "Infinityward", url: "https://careers.infinityward.com", email: null, contact: null },
      { name: "Kabam", url: "https://kabam.com/careers/", email: "careers@kabam.com", contact: null },
      { name: "Kalani Games", url: "https://www.kalanigames.com/careers.html", email: null, contact: "https://www.kalanigames.com/contact.html" },
      { name: "KingsIsle Entertainment", url: "https://apply.workable.com/kingsisle-entertainment-inc/", email: "info@kingsisle.com", contact: "https://www.kingsisle.com/wp/contact-us/" },
      { name: "Lost Boys Interactive", url: "https://lostboysinteractive.applytojob.com/apply", email: null, contact: null },
      { name: "Mad Mushroom", url: "https://apply.workable.com/otk-media/", email: null, contact: "https://otknetwork.com/pages/contact" },
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
  // Email-apply jobs (e.g. BreakAway) — each posting routes to a specific email
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
  "Atomic Theory":            { platform:"ashby", slug:"rocketsciencegg" },
  "Battle Creek Games":       { platform:"ashby", slug:"battle-creek-games" },
  "Certain Affinity":         { platform:"ashby", slug:"certainaffinityinc" },
  "Playgig":                  { platform:"ashby", slug:"playgig" },
  "Second Dinner":            { platform:"ashby", slug:"seconddinner" },
  "Wolfjaw Studios":          { platform:"ashby", slug:"wolfjaw-careers" },
  // ─── ApplytoJob ───
  "Hi-Rez Studios":           { platform:"applytojob", slug:"hirezstudios" },
  "Iron Galaxy":              { platform:"applytojob", slug:"irongalaxy" },
  "Lost Boys Interactive":    { platform:"applytojob", slug:"lostboysinteractive" },
  "Shapeshifter Games":       { platform:"applytojob", slug:"shapeshiftergames" },
  "Templar Media":            { platform:"applytojob", slug:"templar" },
  "Titan Forge":              { platform:"applytojob", slug:"hirezstudios" },
  // ─── BambooHR ───
  "Gasket Games":             { platform:"bamboohr", slug:"gasketgames" },
  "King Show Games":          { platform:"bamboohr", slug:"" },
  "Motorsport Games":         { platform:"bamboohr", slug:"motorsportgames" },
  "Stardock":                 { platform:"bamboohr", slug:"stardock" },
  // ─── Greenhouse studios ───
  "Aspyr":                    { platform:"greenhouse", slug:"aspyrmediainc" },
  "Bend Studio":              { platform:"greenhouse", slug:"sonyinteractiveentertainmentglobal" },
  "Bit Reactor":              { platform:"greenhouse", slug:"bitreactor" },
  "Bungie":                   { platform:"greenhouse", slug:"bungie" },
  "Cat Daddy Games":          { platform:"greenhouse", slug:"catdaddy" },
  "Crystal Dynamics":         { platform:"greenhouse", slug:"crystaldynamics" },
  "Daybreak Games":           { platform:"greenhouse", slug:"daybreakgames" },
  "Digital Extremes":         { platform:"greenhouse", slug:"digitalextremes" },
  "Discord":                  { platform:"greenhouse", slug:"discord" },
  "Epic Games":               { platform:"greenhouse", slug:"epicgames" },
  "Fortis Games":             { platform:"greenhouse", slug:"fortisgames" },
  "Gearbox":                  { platform:"greenhouse", slug:"gearbox" },
  "Ghost Story Games":        { platform:"greenhouse", slug:"gsgcareers" },
  "HB Studios":               { platform:"greenhouse", slug:"hbstudios" },
  "Insomniac Games":          { platform:"greenhouse", slug:"insomniac" },
  "Midsummer Studios":        { platform:"greenhouse", slug:"midsummerstudios" },
  "Mob Entertainment":        { platform:"greenhouse", slug:"mobentertainment" },
  "Nightdive Studios":        { platform:"greenhouse", slug:"nightdivestudios" },
  "Riot Games":               { platform:"greenhouse", slug:"riotgames" },
  "Roblox":                   { platform:"greenhouse", slug:"roblox" },
  "Rockstar Games":           { platform:"greenhouse", slug:"rockstargames" },
  "Scopely":                  { platform:"greenhouse", slug:"scopely" },
  "Singularity 6":            { platform:"greenhouse", slug:"singularity6" },
  "Take-Two Interactive":     { platform:"greenhouse", slug:"taketwo" },
  "The Pokemon Company":      { platform:"greenhouse", slug:"pokemoncareers" },
  "Tripwire Interactive":     { platform:"greenhouse", slug:"tripwireinteractive" },
  "Undead Labs":              { platform:"greenhouse", slug:"undeadlabsllc" },
  "Zynga":                    { platform:"greenhouse", slug:"zyngacareers" },
  // ─── Jobvite ───
  "AGS":                      { platform:"jobvite", slug:"agscareer" },
  "Probably Monsters":        { platform:"jobvite", slug:"probablymonsters" },
  // ─── Lever studios ───
  "Avalanche Studios":        { platform:"lever", slug:"avalanchestudios" },
  "Behaviour Interactive":    { platform:"lever", slug:"bhvr" },
  "Demiurge Studios":         { platform:"lever", slug:"demiurgestudios" },
  "Double Down Interactive":  { platform:"lever", slug:"doubledown" },
  "Golf Plus":                { platform:"lever", slug:"golfscopeinc" },
  "Jam City":                 { platform:"lever", slug:"jamcity" },
  "Kabam":                    { platform:"lever", slug:"kabam" },
  "Skydance":                 { platform:"lever", slug:"skydance" },
  // ─── Paylocity ───
  "Design Works Gaming":      { platform:"paylocity", slug:"design-works-gaming" },
  // ─── Smart Recruiters ───
  "Firehose Games":           { platform:"smartrecruiters", slug:"firehosegames" },
  "Gameloft":                 { platform:"smartrecruiters", slug:"gameloft" },
  "People Can Fly":           { platform:"smartrecruiters", slug:"peoplecanfly" },
  // ─── Workable ───
  "Big Viking Games":         { platform:"workable", slug:"big-viking-games-3" },
  "Crazy Maple Studio":       { platform:"workable", slug:"crazymaplestudio" },
  "Game Sim":                 { platform:"workable", slug:"gamesim-2" },
  "Hardsuit Labs":            { platform:"workable", slug:"hardsuit-labs-1" },
  "High Voltage Software":    { platform:"workable", slug:"high-voltage-software" },
  "Jackbox Games":            { platform:"workable", slug:"jackbox-games" },
  "KingsIsle Entertainment":  { platform:"workable", slug:"kingsisle-entertainment-inc" },
  "Mad Mushroom":             { platform:"workable", slug:"otk-media" },
  "Nexus Studios":            { platform:"workable", slug:"nexusstudios" },
  "Secret 6":                 { platform:"workable", slug:"secret-6" },
  "Sperasoft":                { platform:"workable", slug:"sperasoft" },
  "Velan Studios":            { platform:"workable", slug:"velanstudios" },
};

// Normalize a job from ANY ATS platform into our internal shape
// Pull a clean salary string out of Ashby's compensation object.
// Prefers the ready-made "scrapeable" summary, then a Salary-type component's min/max,
// then the tier summary. Returns "" if no usable salary is present.
// Normalize a raw job location string into a clean grouping label, e.g.
// "Los Angeles, CA, USA" -> "Los Angeles, CA"; remote-ish -> "Remote";
// empty -> "Other". Used to group a studio's jobs by their real location.
const US_STATE_ABBR={alabama:"AL",alaska:"AK",arizona:"AZ",arkansas:"AR",california:"CA",colorado:"CO",connecticut:"CT",delaware:"DE",florida:"FL",georgia:"GA",hawaii:"HI",idaho:"ID",illinois:"IL",indiana:"IN",iowa:"IA",kansas:"KS",kentucky:"KY",louisiana:"LA",maine:"ME",maryland:"MD",massachusetts:"MA",michigan:"MI",minnesota:"MN",mississippi:"MS",missouri:"MO",montana:"MT",nebraska:"NE",nevada:"NV","new hampshire":"NH","new jersey":"NJ","new mexico":"NM","new york":"NY","north carolina":"NC","north dakota":"ND",ohio:"OH",oklahoma:"OK",oregon:"OR",pennsylvania:"PA","rhode island":"RI","south carolina":"SC","south dakota":"SD",tennessee:"TN",texas:"TX",utah:"UT",vermont:"VT",virginia:"VA",washington:"WA","west virginia":"WV",wisconsin:"WI",wyoming:"WY","district of columbia":"DC",ontario:"ON",quebec:"QC","british columbia":"BC",alberta:"AB",manitoba:"MB",saskatchewan:"SK","nova scotia":"NS","new brunswick":"NB","newfoundland and labrador":"NL","prince edward island":"PE"};
function locationLabel(loc){
  const raw=(loc||"").trim();
  if(!raw) return "Other";
  if(/remote|distributed|anywhere|work from home|wfh/i.test(raw)) return "Remote";
  // Split on commas; keep city + state-ish, drop country.
  const parts=raw.split(/[,\u2022\/|]+/).map(s=>s.trim()).filter(Boolean);
  if(!parts.length) return "Other";
  const dropCountry=/^(usa|u\.s\.a?\.?|united states|canada|remote)$/i;
  const kept=parts.filter(p=>!dropCountry.test(p));
  const use=kept.length?kept:parts;
  let city=use[0]||"";
  let region=use[1]||"";
  // Normalize a full state name to its abbreviation.
  const regAbbr=US_STATE_ABBR[region.toLowerCase()];
  if(regAbbr) region=regAbbr;
  else if(region.length>2){ const c=US_STATE_ABBR[region.toLowerCase()]; if(c) region=c; }
  // If city itself is a full state name with no region, just show the state.
  if(!region && US_STATE_ABBR[city.toLowerCase()]) return city;
  const out=[city,region].filter(Boolean).join(", ");
  return out||"Other";
}

function ashbySalary(comp){
  if(!comp) return "";
  // 1. Cleanest: the scrapeable salary summary, e.g. "$81K - $87K"
  if(comp.scrapeableCompensationSalarySummary) return comp.scrapeableCompensationSalarySummary;
  // 2. Look for a Salary component inside the tiers or summary components.
  const pools=[];
  if(Array.isArray(comp.summaryComponents)) pools.push(comp.summaryComponents);
  if(Array.isArray(comp.compensationTiers)) for(const t of comp.compensationTiers){ if(Array.isArray(t.components)) pools.push(t.components); }
  for(const pool of pools){
    const sal=pool.find(c=>c && c.compensationType==="Salary" && (c.minValue||c.maxValue));
    if(sal){
      const fmt=v=>{ if(v==null) return ""; const n=Number(v); if(!isFinite(n)) return ""; return n>=1000?`$${Math.round(n/1000)}K`:`$${n}`; };
      const lo=fmt(sal.minValue), hi=fmt(sal.maxValue);
      if(lo&&hi&&lo!==hi) return `${lo} \u2013 ${hi}`;
      if(lo||hi) return lo||hi;
    }
  }
  // 3. Fall back to the tier summary if it mentions a dollar figure.
  if(comp.compensationTierSummary && /\$/.test(comp.compensationTierSummary)) return comp.compensationTierSummary;
  return "";
}

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
    // Greenhouse pay-transparency ranges, when present.
    if(Array.isArray(raw.pay_input_ranges)&&raw.pay_input_ranges.length){
      const pr=raw.pay_input_ranges[0];
      const fmt=v=>{const n=Number(v);return isFinite(n)?(n>=1000?`$${Math.round(n/1000)}K`:`$${n}`):"";};
      const lo=fmt(pr.min_cents/100),hi=fmt(pr.max_cents/100);
      if(lo&&hi&&lo!==hi) salary=`${lo} \u2013 ${hi}`; else if(lo||hi) salary=lo||hi;
    }
  } else if(platform==="lever"){
    title=raw.text||""; url=raw.hostedUrl||raw.applyUrl||company.url; rawHtml=raw.description||raw.descriptionPlain||""; body=stripHtml(raw.descriptionPlain||raw.description||"");
    loc=raw.categories?.location||""; updated=raw.createdAt||Date.now();
  } else if(platform==="ashby"){
    title=raw.title||""; url=raw.jobUrl||raw.applyUrl||company.url; rawHtml=raw.descriptionHtml||raw.descriptionPlain||""; body=stripHtml(rawHtml)||raw.descriptionPlain||"";
    loc=raw.location||[raw.address?.postalAddress?.addressLocality,raw.address?.postalAddress?.addressRegion].filter(Boolean).join(", ")||"";
    updated=new Date(raw.publishedAt||Date.now()).getTime();
    salary=ashbySalary(raw.compensation)||ashbySalary(raw._boardCompensation)||salary;
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
  let isRemote=/remote|distributed|anywhere/i.test(title+" "+loc+" "+body.slice(0,200));
  // Structured employment type / remote flag when the ATS provides them (Ashby does).
  let jobType="Full-time";
  if(platform==="ashby"){
    if(raw.isRemote===true||raw.workplaceType==="Remote") isRemote=true;
    const et={FullTime:"Full-time",PartTime:"Part-time",Intern:"Internship",Contract:"Contract",Temporary:"Temporary"}[raw.employmentType];
    if(et) jobType=et;
  }
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
    daysAgo, isNew:daysAgo<3, isRemote, type:jobType, salary, email:company.email,
    experience:guessExp(title), isVolunteer:false, isLive:true,
    summary:(parsed.summary||body.slice(0,240)).trim()+((parsed.summary||body).length>240?"\u2026":""),
    fullDescription:body.slice(0,2000),
    responsibilities:parsed.responsibilities, requirements:parsed.requirements, location:loc, locationLabel:locationLabel(loc),
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
  SwordShield:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18.5 3.5l-9 9"/><path d="M3.5 18.5l3-1 3.5-3.5"/><path d="M18.5 3.5l1 1-1 3-2-1z"/><path d="M5.5 3.5l9 9"/><path d="M20.5 18.5l-3-1-3.5-3.5"/><path d="M5.5 3.5l-1 1 1 3 2-1z"/><path d="M6.2 17.8l-2.7 2.7"/><path d="M17.8 17.8l2.7 2.7"/><path d="M9 14l1.2 1.2M15 14l-1.2 1.2"/></svg>,
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
  Target:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.2"/><circle cx="8" cy="8" r="3.4"/><circle cx="8" cy="8" r="0.9" fill={c}/></svg>,
  Clipboard:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="10" height="11.5" rx="1.5"/><path d="M5.6 3V2.2a.8.8 0 0 1 .8-.8h3.2a.8.8 0 0 1 .8.8V3"/><line x1="5.6" y1="6.6" x2="10.4" y2="6.6"/><line x1="5.6" y1="9" x2="10.4" y2="9"/><line x1="5.6" y1="11.4" x2="8.6" y2="11.4"/></svg>,
  Eye:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 8S3.8 3.8 8 3.8 14.5 8 14.5 8 12.2 12.2 8 12.2 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>,
  EyeOff:({s=16,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M6.3 3.9A6.3 6.3 0 0 1 8 3.8C12.2 3.8 14.5 8 14.5 8a11 11 0 0 1-2 2.4M4 4.7A11 11 0 0 0 1.5 8S3.8 12.2 8 12.2a6 6 0 0 0 2.4-.5"/><line x1="2" y1="2" x2="14" y2="14"/></svg>,
  Alert:({s=18})=><svg width={s} height={s} viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="#c0321a"/><line x1="9" y1="5" x2="9" y2="10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="13" r="1" fill="white"/></svg>,
};

// ── AUTH ─────────────────────────────────────────────────────────────────────
// Centered login/signup modal for guests to upgrade to a full account.
function LoginPopup({onClose,onLogin}) {
  const [mode,setMode]=useState("login");
  const [agreed,setAgreed]=useState(false);
  const [name,setName]=useState(""),[email,setEmail]=useState(""),[pass,setPass]=useState("");
  const [err,setErr]=useState(""),[loading,setLoading]=useState(false);
  const G="linear-gradient(135deg,#c9a84c,#e8613a)";
  const submit=async()=>{
    setErr("");
    if(!email||!pass){setErr("Fill in all fields.");return;}
    if(mode==="signup"&&!name){setErr("Enter your name.");return;}
    if(mode==="signup"&&!agreed){setErr("Please agree to the Terms and Privacy Policy.");return;}
    setLoading(true);
    try{
      if(mode==="signup"){
        const {data,error}=await supabase.auth.signUp({email,password:pass});
        if(error){setErr(error.message);setLoading(false);return;}
        await supabase.from("profiles").insert({id:data.user.id,name,data:{tosVersion:TOS_VERSION}});
        onLogin({id:data.user.id,email,name,applied:{},profile:{tosVersion:TOS_VERSION}});
      }else{
        const {data,error}=await supabase.auth.signInWithPassword({email,password:pass});
        if(error){setErr("Invalid email or password.");setLoading(false);return;}
        const {data:profile}=await supabase.from("profiles").select("*").eq("id",data.user.id).single();
        const {data:apps}=await supabase.from("applications").select("*").eq("user_id",data.user.id);
        const applied={};(apps||[]).forEach(a=>{applied[a.job_id]={date:a.applied_at};});
        const profData=(profile&&profile.data)?profile.data:(profile||{});
        onLogin({id:data.user.id,email,name:profile?.name||profData.name||email,applied,profile:profData});
      }
    }catch(e){setErr("Something went wrong. Please try again.");setLoading(false);}
  };
  const inp={width:"100%",background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.2)",color:"#f4edd8",borderRadius:9,padding:"11px 13px",fontSize:13,fontFamily:"inherit",boxSizing:"border-box",marginBottom:10,outline:"none"};
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(4,3,2,.8)",backdropFilter:"blur(4px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:380,background:"linear-gradient(160deg,#140e0a,#0a0608)",border:"1px solid rgba(201,168,76,.25)",borderRadius:16,padding:"26px 24px",position:"relative",boxShadow:"0 24px 70px rgba(0,0,0,.6)"}}>
      <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"none",border:"none",color:"rgba(244,237,216,.4)",cursor:"pointer",fontSize:18,lineHeight:1}}>✕</button>
      <div style={{textAlign:"center",marginBottom:18}}>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:24,fontWeight:700,background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:4}}>Main Quest</div>
        <div style={{fontSize:12,color:"rgba(244,237,216,.5)"}}>{mode==="login"?"Sign in to unlock all features":"Create a free account"}</div>
      </div>
      {mode==="signup"&&<input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>}
      <input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"/>
      <input style={inp} type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Password"/>
      {mode==="signup"&&<label onClick={()=>setAgreed(a=>!a)} style={{display:"flex",alignItems:"flex-start",gap:8,cursor:"pointer",margin:"2px 0 12px",fontSize:11,color:"rgba(244,237,216,.55)",lineHeight:1.4}}><div style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${agreed?"#c9a84c":"rgba(201,168,76,.3)"}`,background:agreed?"#c9a84c":"transparent",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center"}}>{agreed&&<I.Check s={9} c="#0a0608"/>}</div><span>I agree to the <a href="/terms" target="_blank" style={{color:"#c9a84c"}}>Terms</a> and <a href="/privacy" target="_blank" style={{color:"#c9a84c"}}>Privacy Policy</a>.</span></label>}
      {err&&<div style={{fontSize:11.5,color:"#e07060",marginBottom:10,textAlign:"center"}}>{err}</div>}
      <button onClick={submit} disabled={loading} style={{width:"100%",background:G,border:"none",color:"#0a0608",cursor:loading?"default":"pointer",borderRadius:9,padding:"12px",fontSize:13,fontWeight:800,fontFamily:"'Cinzel',serif",letterSpacing:.5,opacity:loading?.7:1,marginBottom:12}}>{loading?"⟳":mode==="login"?"Sign In →":"Create Account →"}</button>
      <p style={{textAlign:"center",fontSize:12,color:"rgba(244,237,216,.4)",margin:0}}>{mode==="login"?"Don't have an account? ":"Already have an account? "}<button onClick={()=>{setMode(m=>m==="login"?"signup":"login");setErr("");}} style={{background:"none",border:"none",cursor:"pointer",color:"#c9a84c",fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:700}}>{mode==="login"?"Sign up free":"Sign in instead"}</button></p>
    </div>
  </div>;
}

// ── ROTATING WIREFRAME GLOBE HEATMAP ──────────────────────────────────────────
// Canvas globe: dotted sphere grid + landmass dots, with glowing hotspots whose
// brightness scales with the number of companies in that region. Slowly rotates
// on a tilted axis (Black Ops-style). Self-contained — no external libraries.
const GLOBE_HOTSPOTS = [
  // [latitude, longitude, weight] — weight ~ company density
  [37.4,-122.1, 1.00], // SF Bay Area / California
  [34.0,-118.2, 0.78], // Los Angeles
  [47.6,-122.3, 0.62], // Seattle / Washington
  [30.3,-97.7,  0.55], // Austin / Texas
  [32.8,-96.8,  0.40], // Dallas
  [40.7,-74.0,  0.42], // New York
  [42.4,-71.1,  0.36], // Boston / Massachusetts
  [28.5,-81.4,  0.30], // Orlando / Florida
  [39.0,-76.9,  0.28], // Maryland / DC
  [39.7,-105.0, 0.24], // Denver / Colorado
  [41.9,-87.6,  0.24], // Chicago / Illinois
  [35.8,-78.6,  0.22], // Raleigh / North Carolina
  [33.7,-84.4,  0.22], // Atlanta / Georgia
  [45.5,-122.7, 0.20], // Portland / Oregon
  [33.4,-112.1, 0.18], // Phoenix / Arizona
  [43.7,-79.4,  0.40], // Toronto / Canada
  [45.5,-73.6,  0.46], // Montreal / Canada
  [49.3,-123.1, 0.30], // Vancouver / Canada
  [51.0,-114.1, 0.18], // Calgary / Canada
];
// A rough world coastline as lat/lon dot clusters (low-res, stylized — enough to read as Earth).
// Natural Earth boundary data (public domain), simplified for canvas rendering.
// Format: array of polylines, each polyline a list of [lon,lat] points.
const GEO_COAST=[[[-163.71,-78.6],[-161.25,-78.38],[-159.21,-79.5],[-161.13,-79.63],[-163.71,-78.6]],[[-6.2,53.87],[-6.03,53.15],[-6.79,52.26],[-9.98,51.82],[-9.17,52.86],[-9.69,53.88],[-7.57,55.13],[-5.66,54.55],[-6.2,53.87]],[[141.0,-2.6],[144.58,-3.86],[145.98,-5.47],[147.65,-6.08],[147.89,-6.61],[146.97,-6.72],[147.19,-7.39],[150.69,-10.58],[147.91,-10.13],[146.05,-8.07],[144.74,-7.63],[143.29,-8.25],[143.41,-8.98],[142.63,-9.33],[139.13,-8.1],[137.61,-8.41],[138.67,-7.32],[137.93,-5.39],[133.66,-3.54],[132.98,-4.11],[131.99,-2.82],[133.7,-2.21],[132.23,-2.21],[130.52,-0.94],[132.38,-0.37],[133.99,-0.78],[134.42,-2.77],[135.46,-3.37],[137.44,-1.7],[141.0,-2.6]],[[114.2,4.53],[116.73,6.92],[119.18,5.41],[117.31,3.23],[119.0,0.9],[117.81,0.78],[117.52,-0.8],[116.56,-1.49],[116.15,-4.01],[110.22,-2.93],[110.07,-1.59],[109.09,-0.46],[109.07,1.34],[109.66,2.01],[111.17,1.85],[111.37,2.7],[113.0,3.1],[114.2,4.53]],[[-93.61,74.98],[-96.82,74.93],[-94.85,75.65],[-93.61,74.98]],[[-93.84,77.52],[-96.44,77.83],[-93.84,77.52]],[[-96.75,78.77],[-95.56,78.42],[-97.31,77.85],[-98.63,78.87],[-96.75,78.77]],[[-88.15,74.39],[-92.42,74.84],[-92.89,75.88],[-93.89,76.32],[-97.12,76.75],[-96.75,77.16],[-91.61,76.78],[-89.19,75.61],[-81.13,75.71],[-79.83,74.92],[-88.15,74.39]],[[-111.26,78.15],[-109.85,78.0],[-112.05,77.41],[-113.53,77.73],[-111.26,78.15]],[[-110.96,78.8],[-109.66,78.6],[-112.54,78.41],[-110.96,78.8]],[[-66.28,18.51],[-65.59,18.23],[-67.18,17.95],[-67.1,18.52],[-66.28,18.51]],[[-77.57,18.49],[-76.2,17.89],[-78.34,18.23],[-77.57,18.49]],[[-82.27,23.19],[-78.35,22.51],[-74.18,20.28],[-77.76,19.86],[-77.09,20.41],[-78.72,21.6],[-82.17,22.39],[-81.8,22.64],[-84.97,21.9],[-82.27,23.19]],[[-55.6,51.32],[-56.8,49.81],[-56.14,50.15],[-55.47,49.94],[-55.82,49.59],[-53.48,49.25],[-53.79,48.52],[-53.09,48.69],[-52.65,47.54],[-53.07,46.66],[-54.18,46.81],[-54.24,47.75],[-55.4,46.88],[-56.0,46.92],[-55.29,47.39],[-56.25,47.63],[-59.27,47.6],[-58.8,48.25],[-59.23,48.52],[-57.36,50.72],[-55.6,51.32]],[[-83.88,65.11],[-80.1,63.73],[-80.99,63.41],[-83.11,64.1],[-85.52,63.05],[-85.87,63.64],[-87.22,63.54],[-86.35,64.04],[-85.88,65.74],[-83.88,65.11]],[[-78.77,72.35],[-77.82,72.75],[-74.1,71.33],[-72.24,71.56],[-68.79,70.53],[-66.97,69.19],[-68.81,68.72],[-61.85,66.86],[-63.92,65.0],[-66.72,66.39],[-68.02,66.26],[-68.14,65.69],[-65.32,64.38],[-64.67,63.39],[-65.01,62.67],[-68.78,63.75],[-66.17,61.93],[-68.88,62.33],[-74.83,64.68],[-78.56,64.57],[-77.9,65.31],[-73.96,65.45],[-73.94,66.31],[-72.65,67.28],[-73.31,68.07],[-76.87,68.89],[-76.23,69.15],[-78.96,70.17],[-81.31,69.74],[-88.68,70.41],[-89.51,70.76],[-88.47,71.22],[-89.89,71.22],[-90.21,72.24],[-88.41,73.54],[-85.83,73.8],[-86.56,73.16],[-85.77,72.53],[-84.85,73.34],[-82.32,73.75],[-80.6,72.72],[-80.75,72.06],[-78.77,72.35]],[[-94.5,74.13],[-90.51,73.86],[-94.27,72.02],[-95.41,72.06],[-96.02,73.44],[-94.5,74.13]],[[-100.44,72.71],[-101.54,73.36],[-97.38,73.76],[-98.05,72.99],[-96.54,72.56],[-96.72,71.66],[-98.36,71.27],[-102.48,72.48],[-100.44,72.71]],[[-107.82,75.85],[-105.88,75.97],[-105.7,75.48],[-112.22,74.42],[-113.87,74.72],[-111.79,75.16],[-117.71,75.22],[-115.4,76.48],[-109.07,75.47],[-110.5,76.43],[-109.58,76.79],[-107.82,75.85]],[[-122.85,76.12],[-119.1,77.51],[-116.2,77.65],[-117.11,76.53],[-122.85,76.12]],[[-121.54,74.45],[-115.51,73.48],[-123.09,70.9],[-125.93,71.87],[-123.94,73.68],[-124.92,74.29],[-121.54,74.45]],[[-166.47,60.38],[-165.58,59.91],[-167.46,60.21],[-166.47,60.38]],[[-153.23,57.97],[-152.14,57.59],[-154.52,56.99],[-154.67,57.46],[-153.23,57.97]],[[-132.71,54.04],[-131.75,54.12],[-132.05,52.98],[-131.18,52.18],[-133.05,53.41],[-133.18,54.17],[-132.71,54.04]],[[-125.42,49.95],[-123.51,48.51],[-125.66,48.83],[-128.44,50.54],[-125.42,49.95]],[[-171.73,63.78],[-168.69,63.3],[-169.53,62.98],[-171.73,63.78]],[[-105.49,79.3],[-100.83,78.8],[-99.67,77.91],[-105.18,78.38],[-104.21,78.68],[-105.49,79.3]],[[32.95,35.39],[34.58,35.67],[32.49,34.7],[32.26,35.1],[32.95,35.39]],[[26.29,35.3],[23.51,35.28],[23.7,35.71],[26.29,35.3]],[[49.54,-12.47],[50.38,-15.71],[49.67,-15.71],[49.77,-16.88],[47.1,-24.94],[45.41,-25.6],[44.04,-24.99],[43.35,-22.78],[44.46,-19.44],[43.96,-17.41],[44.45,-16.22],[46.31,-15.78],[49.19,-12.04],[49.54,-12.47]],[[167.22,-15.89],[167.84,-16.47],[167.22,-15.89]],[[166.79,-15.67],[166.63,-14.63],[167.27,-15.74],[166.79,-15.67]],[[134.21,-6.9],[134.5,-5.45],[134.21,-6.9]],[[-48.66,-78.05],[-43.92,-78.48],[-43.33,-80.03],[-50.48,-81.03],[-54.16,-80.63],[-50.99,-79.61],[-48.66,-78.05]],[[-66.29,-80.26],[-61.88,-80.39],[-60.61,-79.63],[-59.57,-80.04],[-60.16,-81.0],[-64.49,-80.92],[-66.29,-80.26]],[[-73.92,-71.27],[-72.07,-71.19],[-71.74,-69.51],[-70.25,-68.88],[-68.33,-71.41],[-68.78,-72.17],[-71.08,-72.5],[-74.95,-72.07],[-73.92,-71.27]],[[-102.33,-71.89],[-96.79,-71.95],[-96.2,-72.52],[-100.78,-72.5],[-102.33,-71.89]],[[-122.62,-73.66],[-118.72,-73.48],[-120.23,-74.09],[-122.62,-73.66]],[[-127.28,-73.46],[-124.03,-73.87],[-127.28,-73.46]],[[165.78,-21.08],[167.12,-22.16],[165.47,-21.68],[164.03,-20.11],[165.78,-21.08]],[[152.64,-3.66],[152.83,-4.77],[152.41,-3.79],[150.66,-2.74],[152.64,-3.66]],[[151.3,-5.84],[149.71,-6.32],[148.32,-5.75],[150.14,-5.0],[150.81,-5.46],[151.54,-4.17],[152.14,-4.15],[152.32,-4.87],[151.3,-5.84]],[[162.12,-10.48],[162.4,-10.83],[161.7,-10.82],[161.32,-10.2],[162.12,-10.48]],[[161.68,-9.6],[160.58,-8.32],[161.68,-9.6]],[[160.85,-9.87],[159.85,-9.79],[159.7,-9.24],[160.85,-9.87]],[[159.64,-8.02],[159.92,-8.54],[158.21,-7.42],[159.64,-8.02]],[[157.14,-7.02],[157.54,-7.35],[156.54,-6.6],[157.14,-7.02]],[[154.76,-5.34],[155.88,-6.82],[154.76,-5.34]],[[176.89,-40.07],[176.01,-41.29],[175.24,-41.69],[174.65,-41.28],[175.23,-40.46],[173.82,-39.51],[174.57,-38.8],[174.7,-37.38],[172.64,-34.53],[174.33,-35.27],[175.96,-37.56],[178.52,-37.7],[176.89,-40.07]],[[169.67,-43.56],[172.8,-40.49],[173.25,-41.33],[173.96,-40.93],[174.25,-41.35],[172.71,-43.37],[173.08,-43.85],[171.45,-44.24],[170.62,-45.91],[169.33,-46.64],[166.68,-46.22],[167.05,-45.11],[169.67,-43.56]],[[147.69,-40.81],[148.29,-40.88],[147.91,-43.21],[146.05,-43.55],[144.74,-40.7],[147.69,-40.81]],[[126.15,-32.22],[124.22,-32.96],[123.66,-33.89],[119.89,-33.98],[118.02,-35.06],[115.03,-34.2],[115.8,-32.21],[113.34,-26.12],[113.78,-26.55],[113.44,-25.62],[114.23,-26.3],[113.39,-24.38],[113.74,-22.48],[114.15,-21.76],[114.23,-22.52],[116.71,-20.7],[120.86,-19.68],[123.01,-16.41],[123.43,-17.27],[123.86,-17.07],[123.5,-16.6],[125.69,-14.23],[127.07,-13.82],[128.36,-14.87],[129.62,-14.97],[129.41,-14.42],[130.62,-12.54],[132.58,-12.11],[131.82,-11.27],[132.36,-11.13],[135.3,-12.25],[136.49,-11.86],[136.95,-12.35],[135.96,-13.32],[135.5,-15.0],[140.22,-17.71],[141.27,-16.39],[141.69,-12.41],[142.52,-10.67],[143.92,-14.55],[144.56,-14.17],[145.37,-14.98],[146.39,-18.96],[148.85,-20.39],[149.68,-22.34],[150.73,-22.4],[150.9,-23.46],[152.86,-25.27],[153.57,-28.11],[152.89,-31.64],[150.33,-35.67],[150.0,-37.43],[146.32,-39.04],[144.88,-38.42],[145.03,-37.9],[143.61,-38.81],[140.64,-38.02],[139.57,-36.14],[138.12,-35.61],[138.21,-34.38],[136.83,-35.26],[137.81,-32.9],[135.99,-34.89],[134.27,-32.62],[131.33,-31.5],[126.15,-32.22]],[[81.79,7.52],[81.64,6.48],[80.35,5.97],[79.7,8.2],[80.15,9.82],[81.79,7.52]],[[129.37,-2.8],[130.47,-3.09],[130.83,-3.86],[127.9,-3.39],[128.14,-2.84],[129.37,-2.8]],[[126.87,-3.79],[125.99,-3.18],[127.0,-3.13],[126.87,-3.79]],[[127.93,2.17],[128.69,1.13],[128.1,-0.9],[127.4,1.01],[127.93,2.17]],[[122.93,0.88],[125.24,1.42],[123.69,0.24],[120.18,0.24],[120.04,-0.52],[120.94,-1.41],[123.34,-0.62],[121.51,-1.9],[123.16,-5.34],[122.24,-5.28],[122.72,-4.46],[121.49,-4.57],[120.97,-2.63],[120.31,-2.93],[120.43,-5.53],[119.8,-5.67],[119.5,-3.49],[118.77,-2.8],[119.83,0.15],[120.89,1.31],[122.93,0.88]],[[120.3,-10.26],[118.97,-9.56],[119.9,-9.36],[120.78,-9.97],[120.3,-10.26]],[[121.34,-8.54],[122.9,-8.09],[122.76,-8.65],[119.92,-8.81],[120.72,-8.24],[121.34,-8.54]],[[118.26,-8.36],[119.13,-8.71],[116.74,-9.03],[118.26,-8.36]],[[108.49,-6.42],[112.61,-6.95],[112.98,-7.59],[115.71,-8.37],[114.56,-8.75],[105.37,-6.85],[106.05,-5.9],[108.49,-6.42]],[[104.37,-1.08],[104.89,-2.34],[106.11,-3.06],[105.82,-5.85],[104.71,-5.87],[102.58,-4.22],[98.6,1.82],[95.29,5.48],[97.48,5.25],[100.64,2.1],[102.5,1.4],[103.84,0.1],[103.44,-0.71],[104.37,-1.08]],[[120.83,12.7],[120.32,13.47],[121.53,13.07],[121.26,12.21],[120.83,12.7]],[[122.59,9.98],[122.95,10.88],[123.5,10.94],[123.34,10.27],[124.08,11.23],[123.0,9.02],[122.59,9.98]],[[126.38,8.41],[126.54,7.19],[126.2,6.27],[125.83,7.29],[125.36,6.79],[125.4,5.58],[124.22,6.16],[124.24,7.36],[123.61,7.83],[121.92,7.19],[123.49,8.69],[123.84,8.24],[125.47,8.99],[125.41,9.76],[126.38,8.41]],[[109.48,18.2],[108.66,18.51],[108.63,19.37],[110.79,20.08],[110.34,18.68],[109.48,18.2]],[[121.78,24.39],[120.75,21.97],[120.11,23.56],[121.5,25.3],[121.78,24.39]],[[141.88,39.18],[140.96,38.17],[140.25,35.14],[137.22,34.61],[135.79,33.46],[135.08,34.6],[130.99,33.89],[132.0,33.15],[131.33,31.45],[130.69,31.03],[130.2,31.42],[130.45,32.32],[129.41,33.3],[132.62,35.43],[135.68,35.53],[136.72,37.3],[137.39,36.83],[139.43,38.22],[140.31,41.2],[141.37,41.38],[141.88,39.18]],[[144.61,43.96],[145.32,44.38],[145.54,43.26],[144.06,42.99],[143.18,42.0],[141.61,42.68],[141.07,41.58],[139.96,41.57],[139.82,42.56],[140.31,43.33],[141.38,43.39],[141.97,45.55],[144.61,43.96]],[[8.71,40.9],[9.21,41.21],[9.81,40.5],[9.67,39.18],[8.81,38.91],[8.16,40.95],[8.71,40.9]],[[8.75,42.63],[9.39,43.01],[9.23,41.38],[8.75,42.63]],[[12.37,56.11],[12.69,55.61],[12.09,54.8],[11.04,55.36],[10.9,55.78],[12.37,56.11]],[[-4.21,58.55],[-3.01,58.63],[-4.07,57.55],[-1.96,57.68],[-3.12,55.97],[-2.09,55.91],[0.47,52.93],[1.68,52.74],[1.05,51.81],[1.45,51.29],[-5.78,50.16],[-3.41,51.43],[-5.27,51.99],[-4.22,52.3],[-4.58,53.5],[-3.09,53.4],[-2.95,53.98],[-4.84,54.79],[-5.05,55.78],[-5.59,55.31],[-6.15,56.79],[-5.01,58.63],[-4.21,58.55]],[[-14.51,66.46],[-14.74,65.81],[-13.61,65.13],[-18.66,63.5],[-22.76,63.96],[-21.78,64.4],[-23.96,64.89],[-22.23,65.38],[-24.33,65.61],[-22.13,66.41],[-20.58,65.73],[-14.51,66.46]],[[142.91,53.7],[144.65,48.98],[143.17,49.31],[142.56,47.86],[143.51,46.14],[142.75,46.74],[142.09,45.97],[141.68,53.3],[142.61,53.76],[142.21,54.23],[142.91,53.7]],[[118.5,9.32],[117.17,8.37],[119.51,11.37],[119.69,10.55],[118.5,9.32]],[[122.34,18.22],[121.73,14.33],[123.95,13.78],[124.08,12.54],[122.93,13.55],[120.63,13.86],[120.99,14.53],[119.92,15.41],[120.72,18.51],[122.34,18.22]],[[122.04,11.42],[121.88,11.89],[123.12,11.58],[122.0,10.44],[122.04,11.42]],[[125.5,12.16],[125.78,11.05],[125.01,11.31],[125.28,10.36],[124.8,10.13],[124.3,11.5],[124.88,11.79],[124.27,12.56],[125.5,12.16]],[[-77.35,8.67],[-75.67,9.44],[-74.91,11.08],[-73.41,11.23],[-71.75,12.44],[-71.14,12.11],[-71.95,11.42],[-71.7,9.07],[-71.04,9.86],[-71.4,10.97],[-70.16,11.38],[-69.94,12.16],[-68.19,10.55],[-64.89,10.08],[-64.32,10.64],[-61.88,10.72],[-62.73,10.42],[-62.39,9.95],[-60.83,9.38],[-60.67,8.58],[-59.1,8.0],[-57.15,5.97],[-53.96,5.76],[-51.3,4.12],[-49.97,1.74],[-50.39,-0.08],[-48.62,-0.24],[-48.58,-1.24],[-47.82,-0.58],[-44.91,-1.55],[-44.58,-2.69],[-39.98,-2.87],[-37.22,-4.82],[-35.6,-5.15],[-34.73,-7.34],[-35.13,-9.0],[-38.67,-13.06],[-39.27,-17.87],[-40.94,-21.94],[-41.99,-22.97],[-44.65,-23.35],[-47.65,-24.89],[-48.5,-25.88],[-48.89,-28.67],[-53.81,-34.4],[-56.22,-34.86],[-58.43,-33.91],[-56.74,-36.41],[-57.75,-38.18],[-62.34,-38.83],[-62.15,-40.68],[-65.12,-41.06],[-64.98,-42.06],[-63.46,-42.56],[-65.18,-43.5],[-65.57,-45.04],[-67.29,-45.55],[-67.58,-46.3],[-65.64,-47.24],[-69.14,-50.73],[-68.15,-52.35],[-70.85,-52.9],[-71.43,-53.86],[-74.95,-52.26]],[[-77.88,7.22],[-77.13,3.85],[-78.86,1.38],[-80.09,0.77],[-80.93,-1.06],[-80.97,-2.25],[-79.77,-2.66],[-81.41,-4.74],[-81.25,-6.14],[-79.76,-7.19],[-76.01,-14.65],[-71.46,-17.36],[-70.37,-18.35],[-70.16,-19.76],[-70.91,-27.64],[-71.49,-28.86],[-71.44,-32.42],[-73.59,-37.16],[-73.22,-39.26],[-74.33,-43.22],[-73.7,-43.37],[-73.39,-42.12],[-72.72,-42.38],[-73.24,-44.45],[-74.35,-44.1],[-74.69,-45.76],[-75.64,-46.65],[-74.13,-46.94],[-75.61,-48.67],[-74.95,-52.26]],[[-74.66,-52.84],[-71.11,-54.07],[-70.27,-52.93],[-68.63,-52.64],[-67.75,-53.85],[-65.05,-54.7],[-65.5,-55.2],[-66.96,-54.9],[-69.23,-55.5],[-72.26,-54.5],[-74.66,-52.84]],[[44.85,80.59],[51.52,80.7],[47.59,80.01],[46.5,80.25],[47.07,80.56],[44.85,80.59]],[[53.51,73.75],[55.9,74.63],[55.63,75.08],[61.17,76.25],[68.16,76.94],[68.85,76.54],[58.48,74.31],[55.42,72.37],[55.62,71.54],[57.54,70.72],[53.68,70.76],[51.6,71.47],[51.46,72.01],[52.48,72.23],[52.44,72.77],[54.43,73.63],[53.51,73.75]],[[27.41,80.06],[23.02,79.4],[17.37,80.32],[22.92,80.66],[27.41,80.06]],[[24.72,77.85],[20.73,77.68],[21.42,77.94],[20.81,78.25],[22.88,78.45],[24.72,77.85]],[[15.14,79.67],[16.99,80.05],[21.54,78.96],[19.03,78.56],[17.12,76.81],[15.91,76.77],[13.76,77.38],[14.67,77.74],[10.44,79.65],[15.14,79.67]],[[-77.88,7.22],[-79.12,9.0],[-80.38,8.3],[-80.0,7.55],[-80.42,7.27],[-83.51,8.45],[-84.71,9.91],[-85.66,9.93],[-85.71,11.09],[-87.49,13.3],[-91.23,13.93],[-94.69,16.2],[-96.56,15.65],[-103.5,18.29],[-105.49,19.95],[-105.27,21.42],[-106.03,22.77],[-112.23,28.95],[-113.15,31.17],[-114.78,31.8],[-114.67,30.16],[-109.43,23.19],[-110.03,22.82],[-112.18,24.74],[-112.3,26.01],[-115.06,27.72],[-114.16,28.57],[-115.52,29.56],[-117.3,33.05],[-120.62,34.61],[-124.4,40.31],[-123.9,45.52],[-124.69,48.18],[-123.12,48.04],[-122.59,47.1],[-122.84,49],[-127.44,50.83],[-127.85,52.33],[-129.13,52.76],[-129.31,53.56],[-131.97,55.5],[-134.08,58.12],[-136.63,58.21],[-139.87,59.54],[-147.11,60.88],[-148.22,60.67],[-148.02,59.98],[-151.72,59.16],[-151.41,60.73],[-150.62,61.28],[-154.02,59.35],[-153.29,58.86],[-154.23,58.15],[-158.43,55.99],[-164.79,54.4],[-157.72,57.57],[-157.04,58.92],[-161.97,58.67],[-161.87,59.63],[-162.52,59.99],[-163.82,59.8],[-165.35,60.51],[-166.12,61.5],[-165.73,62.07],[-164.56,63.15],[-160.77,63.77],[-161.52,64.4],[-160.78,64.79],[-164.96,64.45],[-168.11,65.67],[-164.47,66.58],[-161.68,66.12],[-166.76,68.36],[-163.17,69.37],[-161.91,70.33],[-156.58,71.36],[-136.5,68.9],[-129.79,70.19],[-129.11,69.78],[-128.14,70.48],[-125.76,69.48],[-124.42,70.16],[-124.29,69.4],[-121.47,69.8],[-113.9,68.4],[-115.3,67.9],[-109.95,67.98],[-108.88,67.38],[-107.79,67.89],[-108.81,68.31],[-108.17,68.65],[-106.15,68.8],[-101.45,67.65],[-98.44,67.78],[-98.56,68.4],[-97.67,68.58],[-96.12,68.24],[-96.13,67.29],[-95.49,68.09],[-94.68,68.06],[-94.23,69.07],[-96.47,70.09],[-96.39,71.19],[-95.21,71.92],[-92.88,71.32],[-91.52,70.19],[-92.41,69.7],[-90.55,69.5],[-90.55,68.47],[-89.22,69.26],[-88.02,68.62],[-88.32,67.87],[-87.35,67.2],[-85.58,68.78],[-85.52,69.88],[-82.62,69.66],[-81.28,69.16],[-81.96,68.13],[-81.39,67.11],[-83.34,66.41],[-85.77,66.56],[-87.32,64.78],[-90.7,63.61],[-90.77,62.96],[-91.93,62.84],[-94.24,60.9],[-94.68,58.95],[-93.22,58.78],[-92.3,57.09],[-90.9,57.28],[-85.01,55.3],[-82.27,55.15],[-82.13,53.28],[-79.91,51.21],[-78.6,52.56],[-79.83,54.67],[-76.54,56.53],[-77.3,58.05],[-78.52,58.8],[-77.34,59.85],[-78.11,62.32],[-73.84,62.44],[-71.37,61.14],[-69.59,61.06],[-69.29,58.96],[-67.65,58.21],[-64.58,60.34],[-61.4,56.97],[-61.8,56.34],[-57.33,54.63],[-55.76,53.27],[-55.68,52.15],[-60.03,50.24],[-66.4,50.23],[-71.1,46.82],[-68.65,48.3],[-65.06,49.23],[-64.17,48.74],[-65.12,48.07],[-64.47,46.24],[-61.52,45.88],[-60.52,47.01],[-59.8,45.92],[-65.36,43.55],[-66.12,43.62],[-66.16,44.47],[-64.43,45.29],[-67.14,45.14],[-70.65,43.09],[-70.83,42.33],[-69.97,41.64],[-73.71,40.93],[-71.95,40.93],[-73.95,40.75],[-74.91,38.94],[-75.53,39.5],[-75.06,38.4],[-75.94,37.22],[-76.35,39.15],[-76.33,38.08],[-76.99,38.24],[-76.3,37.92],[-75.73,35.55],[-81.34,31.44],[-80.06,26.88],[-80.38,25.21],[-81.71,25.87],[-83.71,29.94],[-85.11,29.64],[-86.4,30.4],[-89.59,30.16],[-89.41,29.16],[-93.85,29.71],[-97.37,27.38],[-97.87,22.44],[-95.9,18.83],[-94.43,18.14],[-91.41,18.88],[-90.28,21.0],[-87.05,21.54],[-86.85,20.85],[-87.84,18.26],[-88.3,18.5],[-88.36,16.53],[-88.93,15.89],[-84.98,16.0],[-83.41,15.27],[-83.86,11.37],[-82.55,9.57]],[[-82.55,9.57],[-81.44,8.79],[-79.02,9.55],[-77.35,8.67]],[[-71.71,19.71],[-69.95,19.65],[-68.32,18.61],[-70.67,18.43],[-71.4,17.6],[-74.46,18.34],[-72.33,18.67],[-73.19,19.92],[-71.71,19.71]],[[14.76,38.14],[15.52,38.23],[15.1,36.62],[12.43,37.61],[12.57,38.13],[14.76,38.14]],[[37.54,44.66],[39.96,43.43]],[[132.37,33.46],[133.9,34.36],[134.77,33.81],[133.01,32.7],[132.37,33.46]],[[-16.26,19.1],[-16.97,21.89],[-14.44,26.25],[-9.56,29.93],[-9.3,32.56],[-6.91,34.11],[-5.93,35.76],[-2.17,35.17],[1.47,36.61],[9.51,37.35],[10.18,36.72],[11.1,36.9],[10.34,33.79],[15.25,32.27],[15.71,31.38],[19.09,30.27],[20.05,30.99],[20.13,32.24],[21.54,32.84],[28.91,30.87],[30.98,31.56],[31.96,30.93],[33.77,30.97],[36.0,34.64],[36.16,36.65],[32.51,36.11],[31.7,36.64],[29.7,36.14],[27.64,36.66],[26.32,38.21],[26.8,38.99],[26.17,39.46],[27.28,40.42],[28.82,40.46],[29.24,41.22],[31.15,41.09],[33.51,42.02],[38.35,40.95],[41.55,41.54],[41.45,42.65],[36.68,45.24],[38.23,46.24],[37.67,46.64],[39.12,47.26],[34.96,46.27],[35.02,45.65],[36.53,45.47],[36.33,45.11],[33.88,44.36],[32.45,45.33],[33.3,46.08],[30.75,46.58],[29.63,45.04],[28.84,44.91],[27.67,42.58],[28.81,41.05],[26.36,40.15],[26.06,40.82],[24.93,40.95],[23.71,40.69],[24.41,40.12],[23.9,39.96],[22.63,40.26],[24.04,37.66],[23.12,37.92],[23.15,36.42],[22.49,36.41],[19.41,40.25],[19.54,41.72],[13.14,45.74],[12.33,45.38],[12.59,44.09],[18.48,40.17],[16.87,40.44],[16.45,39.8],[17.05,38.9],[16.1,37.99],[15.68,37.91],[16.11,38.96],[15.41,40.05],[12.11,41.7],[10.51,42.93],[10.2,43.92],[8.89,44.37],[6.53,43.13],[3.1,43.08],[3.04,41.89],[0.81,41.01],[-0.28,39.31],[0.11,38.74],[-2.15,36.67],[-4.37,36.68],[-5.38,35.95],[-6.52,36.94],[-8.9,36.87],[-8.84,38.27],[-9.53,38.74],[-8.77,40.76],[-9.39,43.03],[-7.98,43.75],[-1.9,43.42],[-1.38,44.02],[-1.19,46.01],[-2.96,47.57],[-4.49,47.95],[-4.59,48.68],[-1.62,48.64],[-1.93,49.78],[-0.99,49.35],[1.34,50.13],[1.64,50.95],[3.83,51.62],[4.71,53.09],[8.12,53.53],[8.8,54.02],[8.12,55.52],[8.54,57.11],[10.58,57.73],[10.25,56.89],[10.91,56.46],[9.65,55.47],[10.94,54.01],[12.52,54.47],[14.12,53.76],[17.62,54.85],[19.66,54.43],[21.27,55.19],[21.58,57.41],[22.52,57.75],[24.12,57.03],[24.43,58.38],[23.43,58.61],[23.34,59.19],[29.12,60.03],[28.07,60.5],[22.87,59.85],[21.32,60.72],[21.06,62.61],[21.54,63.19],[25.4,65.11],[23.9,66.01],[22.18,65.72],[21.21,65.03],[21.37,64.41],[17.85,62.75],[17.12,61.34],[18.79,60.08],[17.87,58.95],[16.83,58.72],[15.88,56.1],[12.94,55.36],[10.36,59.47],[8.38,58.31],[5.67,58.59],[4.99,61.97],[10.53,64.49],[14.76,67.81],[19.18,69.82],[28.17,71.19],[31.29,70.45],[30.01,70.19],[31.1,69.56],[32.13,69.91],[36.51,69.06],[41.06,67.46],[41.13,66.79],[38.38,66.0],[33.18,66.63],[34.81,65.9],[34.94,64.41],[37.01,63.85],[36.54,64.76],[37.18,65.14],[39.59,64.52],[40.44,64.76],[39.76,65.5],[42.09,66.48],[43.95,66.07],[44.53,66.76],[43.7,67.35],[44.17,67.96],[43.45,68.57],[46.25,68.25],[46.82,67.69],[45.56,67.57],[45.56,67.01],[46.35,66.67],[53.72,68.86],[54.47,68.81],[53.49,68.2],[58.8,68.88],[59.94,68.28],[61.08,68.94],[60.03,69.52],[60.55,69.85],[68.51,68.09],[69.18,68.62],[66.93,69.45],[66.69,71.03],[69.94,73.04],[72.59,72.78],[72.8,72.22],[71.85,71.41],[72.79,70.39],[72.56,69.02],[73.67,68.41],[71.28,66.32],[72.42,66.17],[75.05,67.76],[74.47,68.33],[74.94,68.99],[73.6,69.63],[74.4,70.63],[73.1,71.45],[74.89,72.12],[74.66,72.83],[75.68,72.3],[75.29,71.34],[76.36,71.15],[75.9,71.87],[77.58,72.27],[81.5,71.75],[80.61,72.58],[80.51,73.65],[86.82,73.94],[86.01,74.46],[87.17,75.12],[100.76,76.43],[104.35,77.7],[107.24,76.48],[111.08,76.71],[114.13,75.85],[113.89,75.33],[109.4,74.18],[113.02,73.98],[113.53,73.34],[115.57,73.75],[123.2,72.97],[123.26,73.74],[126.98,73.57],[128.59,73.04],[129.05,72.4],[128.46,71.98],[131.29,70.79],[132.25,71.84],[139.87,71.49],[139.15,72.42],[140.47,72.85],[149.5,72.2],[152.97,70.84],[159.0,70.87],[159.83,70.45],[159.71,69.72],[160.94,69.44],[167.86,69.57],[169.58,68.69],[170.82,69.01],[170.01,69.65],[170.45,70.1],[175.72,69.88],[180,68.96]],[[180,64.98],[177.41,64.61],[179.37,62.98],[179.23,62.3],[177.36,62.52],[173.68,61.65],[170.33,59.88],[168.9,60.57],[166.29,59.79],[163.54,59.87],[162.02,58.24],[163.19,57.62],[163.06,56.16],[162.13,56.12],[161.7,55.29],[162.12,54.86],[160.37,54.34],[160.02,53.2],[158.53,52.96],[158.23,51.94],[156.79,51.01],[155.43,55.38],[155.91,56.77],[156.81,57.83],[158.36,58.06],[163.67,61.14],[164.47,62.55],[163.26,62.47],[160.12,60.54],[159.3,61.77],[156.72,61.43],[154.22,59.76],[155.04,59.14],[151.27,58.78],[151.34,59.5],[149.78,59.66],[142.2,59.04],[135.13,54.73],[138.16,53.76],[139.9,54.19],[141.35,53.09],[141.38,52.24],[140.6,51.24],[140.06,48.45],[138.22,46.31],[134.87,43.4],[133.54,42.81],[132.28,43.28],[127.53,39.76],[127.39,39.21],[129.46,36.78],[129.09,35.08],[126.49,34.39],[126.12,36.73],[126.86,36.89],[126.17,37.75],[124.71,38.11],[125.32,39.55],[124.27,39.93],[121.05,38.9],[122.17,40.42],[121.64,40.95],[118.04,39.2],[117.53,38.74],[118.91,37.45],[119.7,37.16],[120.82,37.87],[122.36,37.45],[122.52,36.93],[121.1,36.65],[119.15,34.91],[120.23,34.36],[121.91,31.69],[121.26,30.68],[122.09,29.83],[121.68,28.23],[118.66,24.55],[115.89,22.78],[110.79,21.4],[110.44,20.34],[109.89,20.28],[109.86,21.4],[108.52,21.72],[105.88,19.75],[105.66,19.06],[108.88,15.28],[109.34,13.43],[109.2,11.67],[105.16,8.6],[105.08,9.92],[103.5,10.63],[102.58,12.19],[100.83,12.63],[100.98,13.41],[100.1,13.41],[99.22,9.24],[99.87,9.21],[100.46,7.43],[102.96,5.52],[104.23,1.29],[101.39,2.76],[100.09,6.46],[98.5,8.38],[98.34,7.79],[98.76,11.44],[97.16,16.93],[95.37,15.71],[94.19,16.04],[94.32,18.21],[91.42,22.77],[90.5,22.81],[90.27,21.84],[86.98,21.5],[86.5,20.15],[85.06,19.48],[82.19,16.56],[80.32,15.9],[79.86,10.36],[77.54,7.97],[76.59,8.9],[73.53,15.99],[72.63,21.36],[70.47,20.88],[69.16,22.09],[69.35,22.84],[67.44,23.94],[66.37,25.43],[61.5,25.08],[57.4,25.74],[56.49,27.14],[54.72,26.48],[51.52,27.87],[50.12,30.15],[47.97,29.98],[50.81,24.75],[51.01,26.01],[51.59,25.8],[51.79,24.02],[54.01,24.12],[56.36,26.4],[56.85,24.24],[58.73,23.57],[59.81,22.31],[57.83,20.24],[57.69,18.94],[55.27,17.23],[52.39,16.38],[52.17,15.6],[48.68,14.0],[43.48,12.64],[42.65,16.77],[39.14,21.29],[38.49,23.69],[34.63,28.06],[34.92,29.5],[33.92,27.65],[32.42,29.85],[35.69,23.93],[35.53,23.1],[36.87,22],[37.48,18.61],[38.41,18.0],[39.27,15.92],[43.32,12.39],[42.72,11.74],[44.61,10.44],[51.11,12.02],[51.05,10.64],[47.74,4.22],[40.26,-2.57],[39.2,-4.68],[38.74,-5.91],[39.44,-6.84],[39.19,-8.49],[40.48,-10.77],[40.78,-14.69],[40.09,-16.1],[34.79,-19.78],[35.56,-22.09],[35.46,-24.12],[32.57,-25.73],[32.46,-28.3],[30.06,-31.14],[25.78,-33.94],[22.57,-33.86],[19.62,-34.82],[18.38,-34.14],[18.22,-31.66],[15.21,-27.09],[14.26,-22.11],[11.79,-18.07],[11.78,-15.79],[13.63,-12.04],[13.69,-10.73],[11.91,-5.04],[8.8,-1.11],[9.8,3.07],[9.4,3.73],[8.5,4.77],[5.9,4.26],[4.33,6.27],[1.87,6.14],[-1.96,4.71],[-4.65,5.17],[-7.52,4.34],[-9.0,4.83],[-12.43,7.26],[-14.84,10.88],[-16.61,12.17],[-16.71,13.59],[-17.63,14.73],[-16.46,16.14],[-16.26,19.1]],[[-177.55,68.2],[-180.0,68.96]],[[-180.0,-16.07],[-180.0,-16.56]],[[125.95,-8.43],[127.34,-8.4],[123.46,-10.24],[123.98,-9.29],[125.95,-8.43]],[[-180,-84.71],[-179.06,-84.14],[-174.38,-84.53],[-169.95,-83.88],[-158.07,-85.37],[-148.53,-85.61],[-143.11,-85.04],[-142.89,-84.57],[-153.59,-83.69],[-152.86,-82.04],[-156.84,-81.1],[-150.65,-81.34],[-146.42,-80.34],[-149.53,-79.36],[-155.33,-79.06],[-158.05,-78.03],[-158.37,-76.89],[-151.33,-77.4],[-146.1,-76.48],[-146.2,-75.38],[-144.91,-75.2],[-135.21,-74.3],[-119.7,-74.48],[-113.94,-73.71],[-112.3,-74.71],[-107.56,-75.18],[-100.65,-75.3],[-100.12,-74.87],[-102.55,-74.11],[-103.68,-72.62],[-96.34,-73.62],[-90.09,-73.32],[-89.23,-72.56],[-85.19,-73.48],[-81.47,-73.85],[-80.3,-73.13],[-76.22,-73.97],[-68.94,-73.01],[-67.13,-72.05],[-68.54,-69.72],[-67.25,-66.88],[-63.0,-64.64],[-57.81,-63.27],[-57.22,-63.53],[-62.02,-64.8],[-62.65,-65.48],[-62.12,-66.19],[-63.75,-66.5],[-65.67,-67.95],[-63.2,-69.23],[-61.81,-70.72],[-60.83,-73.7],[-64.35,-75.26],[-70.6,-76.63],[-77.24,-76.71],[-73.66,-77.91],[-77.93,-78.38],[-78.02,-79.18],[-75.36,-80.26],[-59.69,-82.38],[-58.22,-83.22],[-49.76,-81.73],[-42.81,-82.08],[-40.77,-81.36],[-28.55,-80.34],[-29.69,-79.26],[-35.64,-79.46],[-35.78,-78.34],[-28.88,-76.67],[-17.52,-75.13],[-15.7,-74.5],[-15.41,-74.11],[-16.47,-73.87],[-15.45,-73.15],[-10.3,-71.27],[-7.42,-71.7],[-6.87,-70.93],[-0.23,-71.64],[7.74,-69.89],[9.53,-70.01],[10.82,-70.83],[13.42,-69.97],[27.09,-70.46],[31.99,-69.66],[33.87,-68.5],[38.65,-69.78],[54.53,-65.82],[61.43,-67.95],[64.05,-67.41],[68.89,-67.93],[69.67,-69.23],[67.81,-70.31],[69.07,-70.68],[67.95,-71.85],[69.87,-72.26],[71.02,-72.09],[73.86,-69.87],[77.64,-69.46],[79.11,-68.33],[82.78,-67.21],[86.75,-67.15],[87.99,-66.21],[89.67,-67.15],[95.78,-67.39],[99.72,-67.25],[102.83,-65.56],[106.18,-66.93],[113.6,-65.88],[119.83,-67.27],[123.22,-66.48],[128.8,-66.76],[134.76,-66.21],[135.07,-65.31],[137.46,-66.95],[145.49,-66.92],[146.65,-67.9],[148.84,-68.39],[154.28,-68.56],[161.57,-70.58],[167.31,-70.83],[171.21,-71.7],[169.29,-73.66],[166.09,-74.38],[163.57,-76.24],[163.49,-77.07],[164.74,-78.18],[167.0,-78.75],[161.77,-79.16],[159.79,-80.95],[169.4,-83.83],[180,-84.71]],[[-180,68.96],[-174.93,67.21],[-175.01,66.58],[-174.34,66.34],[-174.57,67.06],[-171.86,66.91],[-169.9,65.98],[-172.53,65.44],[-172.96,64.25],[-176.21,65.36],[-178.36,65.39],[-178.69,66.11],[-179.88,65.87],[-179.43,65.4],[-180,64.98]],[[-180,71.52],[-177.58,71.27],[-180,70.83]],[[180,70.83],[178.73,71.1],[180,71.52]],[[180,-16.56],[178.6,-16.64],[180,-16.07]],[[-61.2,-51.85],[-58.55,-51.1],[-57.75,-51.55],[-59.4,-52.2],[-61.2,-51.85]],[[68.94,-48.62],[70.56,-49.26],[68.75,-49.77],[68.94,-48.62]],[[178.13,-17.5],[178.72,-17.63],[178.55,-18.15],[177.38,-18.16],[178.13,-17.5]],[[-61.68,10.76],[-60.9,10.86],[-60.94,10.11],[-61.95,10.09],[-61.68,10.76]],[[-155.4,20.08],[-154.81,19.51],[-155.69,18.92],[-156.07,19.7],[-155.4,20.08]],[[-156.0,20.76],[-156.71,20.93],[-156.0,20.76]],[[-156.76,21.18],[-157.33,21.1],[-156.76,21.18]],[[-158.03,21.72],[-157.71,21.26],[-158.03,21.72]],[[-159.37,22.21],[-159.8,22.07],[-159.37,22.21]],[[-78.19,25.21],[-77.53,23.76],[-78.41,24.58],[-78.19,25.21]],[[-78.98,26.79],[-77.82,26.58],[-78.98,26.79]],[[-77.79,27.04],[-77,26.59],[-77.17,25.88],[-77.79,27.04]],[[-64.01,47.04],[-62.01,46.44],[-62.87,45.97],[-64.14,46.39],[-64.01,47.04]],[[46.68,44.61],[49.1,46.4],[51.19,47.05],[53.04,46.85],[53.04,45.26],[50.31,44.61],[51.34,43.13],[52.5,42.79],[52.81,41.14],[52.92,41.87],[53.72,42.12],[54.74,40.95],[52.92,40.88],[52.69,40.03],[53.36,39.98],[53.1,39.29],[53.88,38.95],[53.83,36.97],[50.84,36.87],[49.2,37.58],[48.86,38.82],[49.57,40.18],[50.39,40.26],[47.49,42.99],[46.68,44.61]],[[-64.52,49.87],[-61.81,49.11],[-64.52,49.87]],[[-80.32,62.09],[-79.27,62.16],[-79.66,61.63],[-80.32,62.09]],[[-83.99,62.45],[-81.88,62.9],[-83.07,62.16],[-83.99,62.45]],[[-75.22,67.44],[-76.99,67.1],[-77.24,67.59],[-75.9,68.29],[-75.11,68.01],[-75.22,67.44]],[[-96.56,69.68],[-95.65,69.11],[-99.8,69.4],[-98.22,70.14],[-96.56,69.68]],[[-106.52,73.08],[-105.4,72.67],[-104.46,70.99],[-100.98,70.02],[-101.09,69.58],[-102.73,69.5],[-102.09,69.12],[-102.43,68.75],[-105.96,69.18],[-113.31,68.54],[-117.34,69.96],[-112.42,70.37],[-117.9,70.54],[-118.43,70.91],[-116.11,71.31],[-119.4,71.56],[-117.87,72.71],[-115.19,73.31],[-114.17,73.12],[-114.67,72.65],[-112.44,72.96],[-111.05,72.45],[-109.92,72.96],[-108.19,71.65],[-107.69,72.07],[-108.4,73.09],[-106.52,73.08]],[[-79.78,72.8],[-80.83,73.69],[-78.06,73.65],[-76.25,72.83],[-79.78,72.8]],[[139.86,73.37],[142.06,73.86],[143.6,73.21],[139.86,73.37]],[[148.22,75.35],[150.73,75.08],[149.58,74.69],[146.12,75.17],[148.22,75.35]],[[138.83,76.14],[145.09,75.56],[144.3,74.82],[138.96,74.61],[136.97,75.26],[138.83,76.14]],[[-98.58,76.59],[-97.74,76.26],[-98.16,75],[-102.5,75.56],[-102.57,76.34],[-98.58,76.59]],[[102.84,79.28],[105.37,78.71],[99.44,77.92],[101.26,79.23],[102.84,79.28]],[[93.78,81.02],[95.94,81.25],[100.19,79.78],[99.94,78.88],[97.76,78.76],[91.18,80.34],[93.78,81.02]],[[-96.02,80.6],[-92.41,81.26],[-85.81,79.34],[-89.04,78.29],[-92.88,78.34],[-93.95,78.75],[-93.15,79.38],[-96.71,80.16],[-96.02,80.6]],[[-91.59,81.89],[-85.5,82.65],[-83.18,82.32],[-79.31,83.13],[-61.85,82.63],[-67.66,81.5],[-65.48,81.51],[-71.18,79.8],[-76.91,79.32],[-75.53,79.2],[-76.22,79.02],[-75.39,78.53],[-79.76,77.21],[-77.89,76.78],[-80.56,76.18],[-89.49,76.47],[-89.62,76.95],[-87.77,77.18],[-88.26,77.9],[-84.98,77.54],[-87.96,78.37],[-85.09,79.35],[-86.93,80.25],[-81.85,80.46],[-87.6,80.52],[-91.59,81.89]],[[-46.76,82.63],[-38.62,83.55],[-27.1,83.52],[-20.85,82.73],[-31.9,82.2],[-22.07,81.73],[-23.17,81.15],[-15.77,81.91],[-12.21,81.29],[-20.05,80.18],[-17.73,80.13],[-19.7,78.75],[-19.67,77.64],[-18.47,76.99],[-21.68,76.63],[-19.83,76.1],[-19.6,75.25],[-20.67,75.16],[-19.37,74.3],[-21.59,74.22],[-20.43,73.82],[-20.76,73.46],[-23.57,73.31],[-22.3,72.18],[-24.79,72.33],[-22.13,71.47],[-21.75,70.66],[-23.54,70.47],[-25.54,71.43],[-25.2,70.75],[-26.36,70.23],[-22.35,70.13],[-27.75,68.47],[-31.78,68.12],[-34.2,66.68],[-39.81,65.46],[-41.19,63.48],[-42.82,62.68],[-42.42,61.9],[-43.38,60.1],[-48.26,60.86],[-51.63,63.63],[-53.97,67.19],[-52.98,68.36],[-51.48,68.73],[-50.87,69.93],[-53.46,69.28],[-54.68,69.61],[-54.36,70.82],[-51.39,70.57],[-55.83,71.65],[-54.72,72.59],[-58.59,75.52],[-61.27,76.1],[-68.5,76.06],[-71.4,77.01],[-66.76,77.38],[-73.3,78.04],[-65.71,79.39],[-65.32,79.76],[-68.02,80.12],[-62.23,81.32],[-62.65,81.77],[-53.04,81.89],[-50.39,82.44],[-44.52,81.66],[-46.9,82.2],[-46.76,82.63]],[[-106.6,73.6],[-104.5,73.42],[-105.38,72.76],[-106.6,73.6]]];
const GEO_COUNTRIES=[[[-130.54,54.8],[-130.01,55.92],[-135.48,59.79],[-137.45,58.91],[-141.0,60.31],[-140.99,69.71]],[[-117.13,32.54],[-114.72,32.72],[-111.02,31.33],[-106.51,31.75],[-103.94,29.27],[-100.96,29.38],[-99.02,26.37],[-97.14,25.87]],[[-90.1,13.74],[-89.35,14.42]],[[-92.23,14.54],[-91.75,16.07],[-90.46,16.07],[-91.45,17.25],[-91.0,17.82],[-89.14,17.81]],[[-88.93,15.89],[-89.14,17.81]],[[-89.35,14.42],[-87.79,13.38]],[[-87.32,12.98],[-84.92,14.79],[-83.15,15.0]],[[-82.97,8.23],[-82.55,9.57]],[[-83.66,10.94],[-85.71,11.09]],[[-77.35,8.67],[-77.88,7.22]],[[-71.33,11.78],[-73.3,9.15],[-71.96,6.99],[-67.34,6.1],[-67.81,2.82],[-66.88,1.25]],[[-75.37,-0.15],[-75.55,-1.56],[-77.84,-3.0],[-79.21,-4.96],[-80.44,-4.43],[-80.3,-3.4]],[[-69.53,-10.95],[-70.55,-11.01],[-70.48,-9.49],[-71.3,-10.08],[-73.23,-9.46],[-73.99,-7.52],[-72.89,-5.27],[-69.89,-4.3]],[[-66.96,-54.9],[-68.63,-54.87],[-68.63,-52.64]],[[-68.63,-52.3],[-71.91,-52.01],[-73.42,-49.32],[-72.33,-48.24],[-71.22,-44.78],[-72.15,-42.25],[-70.81,-38.55],[-71.12,-36.66],[-69.82,-34.19],[-70.54,-31.36],[-69.66,-28.46],[-68.3,-26.9],[-68.42,-24.52],[-67.33,-24.03],[-67.11,-22.74]],[[-58.43,-33.91],[-57.63,-30.22]],[[-54.63,-25.74],[-55.7,-27.39],[-58.62,-27.12],[-57.78,-25.16],[-62.69,-22.25]],[[-58.17,-20.18],[-57.94,-22.09],[-55.8,-22.36],[-55.4,-23.96],[-54.29,-24.02],[-54.63,-25.74]],[[-59.76,8.37],[-61.41,5.96],[-60.73,5.2]],[[-56.54,1.9],[-58.54,1.27],[-59.65,1.79],[-59.54,3.96],[-60.73,5.2]],[[-54.52,2.31],[-56.54,1.9]],[[-51.66,4.16],[-52.94,2.12],[-54.52,2.31]],[[115.45,5.45],[115.35,4.32],[114.2,4.53]],[[-6.2,53.87],[-7.57,54.06],[-7.57,55.13]],[[-16.71,13.59],[-13.84,13.51],[-16.84,13.15]],[[35.55,32.39],[35.4,31.49]],[[28.98,-28.96],[28.11,-30.55],[27.0,-29.88],[28.98,-28.96]],[[-8.67,27.66],[-8.69,25.88],[-11.97,25.93],[-11.94,23.37],[-12.87,23.28],[-12.93,21.33],[-17.06,21.0]],[[-8.68,27.4],[-4.92,24.97]],[[-12.17,14.62],[-11.51,12.44]],[[-13.7,12.59],[-15.13,11.04]],[[-11.51,12.44],[-10.17,11.84],[-9.13,12.31],[-8.03,10.21]],[[-11.44,6.79],[-10.23,8.41]],[[-8.44,7.69],[-7.71,4.36]],[[8.42,36.95],[7.61,33.34],[9.06,32.1],[9.48,30.31]],[[11.49,33.14],[9.48,30.31]],[[25.16,31.57],[25,22]],[[4.27,19.16],[3.64,15.57],[0.37,14.93]],[[0.37,14.93],[1.02,12.85],[2.18,12.63],[2.15,11.94]],[[-2.86,4.99],[-2.83,9.64]],[[1.06,5.93],[0.02,11.02]],[[0.9,11.0],[1.87,6.14]],[[2.15,11.94],[3.61,11.66]],[[3.61,11.66],[4.37,13.75],[9.01,12.83],[13.32,13.56]],[[36.87,22],[25,22]],[[14.85,22.86],[15.9,20.39],[15.25,16.63],[13.54,14.37],[14.5,12.86]],[[23.84,19.58],[23.89,15.61],[23.02,15.68],[21.94,12.59],[22.86,11.14]],[[15.28,7.42],[14.48,4.73],[16.01,2.27]],[[11.28,2.26],[11.29,1.06],[9.49,1.01]],[[13.08,2.27],[13.28,1.31],[14.28,1.2],[14.3,-2.0],[12.58,-1.95],[11.09,-3.98]],[[16.01,2.27],[17.13,3.73],[18.45,3.5]],[[22.86,11.14],[23.81,8.67]],[[36.43,14.42],[40.03,14.52],[42.35,12.54]],[[43.15,11.46],[42.78,10.93]],[[29.58,-1.34],[30.42,-1.13]],[[30.42,-1.13],[30.47,-2.41]],[[23.91,-10.93],[24.02,-12.91],[21.93,-12.9],[21.89,-16.08],[23.22,-17.52]],[[23.22,-17.52],[24.93,-17.72]],[[32.07,-26.73],[31.28,-27.29],[30.69,-26.74],[31.04,-25.73],[31.84,-25.84]],[[25.26,-17.74],[28.02,-21.49],[29.43,-22.09]],[[30.27,-15.51],[32.85,-16.71],[32.66,-20.3],[31.19,-22.25]],[[32.83,-26.74],[32.07,-26.73]],[[-9.03,41.88],[-8.26,42.28],[-6.39,41.38],[-7.5,39.63],[-7.45,37.1]],[[2.99,42.47],[-1.9,43.42]],[[9.92,54.98],[8.53,54.96]],[[6.19,49.46],[8.1,49.02],[7.47,47.62]],[[14.12,53.76],[15.02,51.11]],[[9.59,47.53],[10.44,46.89]],[[10.44,46.89],[13.81,46.51]],[[19.66,54.43],[23.48,53.91],[23.8,52.69],[23.2,52.49],[24.03,50.71],[22.78,49.03],[18.91,49.44],[15.02,51.11]],[[24.31,57.79],[27.29,57.47]],[[27.98,59.48],[27.29,57.47]],[[28.18,56.17],[30.87,55.55],[30.76,54.81],[32.69,53.35],[31.31,53.07],[31.79,52.1]],[[6.91,53.48],[6.16,50.8]],[[6.16,50.8],[6.04,50.13]],[[6.04,50.13],[6.19,49.46]],[[21.27,55.19],[22.73,54.33]],[[21.06,56.03],[24.86,56.37],[26.49,55.62]],[[18.85,49.5],[16.96,48.6]],[[16.96,48.6],[16.98,48.12]],[[22.09,48.42],[22.71,47.88],[21.02,46.32],[18.46,45.76],[16.2,46.85]],[[18.45,42.48],[15.75,44.82],[19.01,44.86]],[[22.56,49.09],[21.87,48.32],[16.98,48.12]],[[16.56,46.5],[15.33,45.45],[13.72,45.5]],[[26.62,48.22],[28.13,46.81],[28.23,45.49]],[[28.56,43.71],[22.66,44.23]],[[22.66,44.23],[22.36,42.32]],[[22.71,47.88],[26.62,48.22]],[[31.79,52.1],[33.75,52.34],[35.36,50.58],[40.07,49.6],[39.74,47.9],[38.22,47.1]],[[28.0,42.01],[22.95,41.34],[22.38,42.32]],[[22.95,41.34],[21.02,40.84]],[[26.12,41.83],[26.6,41.56],[26.06,40.82]],[[21.02,40.84],[20.15,39.62]],[[41.55,41.54],[43.58,41.09]],[[39.95,43.44],[45.47,42.5],[46.64,41.18],[44.97,41.25]],[[28.59,69.06],[28.45,68.36],[29.98,67.7],[29.05,66.94],[30.22,65.81],[29.54,64.95],[30.44,64.2],[30.04,63.55],[31.52,62.87],[28.07,60.5]],[[35.4,31.48],[34.92,29.5]],[[38.79,33.38],[39.2,32.16]],[[47.97,29.98],[46.57,29.1]],[[48.57,29.93],[47.33,32.47],[45.42,33.97],[46.08,35.68],[44.77,37.17]],[[53.92,37.2],[57.33,38.03],[61.12,36.49],[61.21,35.65]],[[53.11,16.65],[52,19]],[[42.78,16.35],[43.38,17.58],[47,16.95],[49.12,18.62],[52,19]],[[20.65,69.11],[23.54,67.94],[23.9,66.01]],[[48.42,28.55],[46.57,29.1]],[[51.39,24.63],[50.81,24.75]],[[56.07,26.06],[56.26,25.71]],[[56.4,24.92],[55.21,22.71]],[[49.1,46.4],[46.47,48.39],[47.55,50.45],[48.58,49.87],[50.77,51.69],[55.72,50.62],[61.34,50.8],[61.59,51.27],[59.97,51.96],[61.7,52.98],[60.98,53.67],[61.44,54.01],[69.07,55.39],[70.87,55.17],[71.18,54.13],[73.51,54.04],[73.43,53.49],[76.89,54.49],[80.04,50.86],[83.38,51.07],[87.36,49.22]],[[70.96,42.27],[70.42,41.52],[73.06,40.87],[71.77,40.15],[70.6,40.22],[70.67,40.96],[69.33,40.73],[68.54,39.53],[67.7,39.58],[68.39,38.16],[67.83,37.15]],[[66.52,37.36],[64.75,37.11],[62.98,35.4],[61.21,35.65]],[[67.83,37.15],[69.2,37.15],[70.81,38.49],[71.84,36.74],[74.98,37.42]],[[80.26,42.35],[73.68,39.43]],[[73.68,39.43],[74.98,37.42]],[[74.45,32.76],[75.26,32.27]],[[97.33,28.26],[97.13,27.08],[95.12,26.57],[92.67,22.04]],[[88.12,27.88],[81.11,30.18]],[[88.81,27.3],[90.02,28.3],[91.7,27.77]],[[92.37,20.67],[92.67,22.04]],[[97.33,28.26],[98.68,27.51],[97.6,23.9],[98.66,24.06],[99.53,22.95],[99.24,22.12],[101.18,21.44]],[[100.12,20.42],[101.28,19.46],[101.06,17.51],[103.96,18.24],[105.59,15.57],[105.22,14.27],[102.99,14.23],[102.58,12.19]],[[101.18,21.44],[101.8,21.17],[102.17,22.46]],[[107.38,14.2],[107.49,12.34],[105.81,11.57],[106.25,10.96],[104.33,10.49]],[[102.17,22.46],[105.33,23.35],[108.05,21.55]],[[102.14,6.22],[101.15,5.69],[100.09,6.46]],[[117.88,4.14],[115.87,4.31],[114.62,1.43],[113.81,1.22],[110.51,0.77],[109.66,2.01]],[[87.75,49.3],[92.23,50.8],[97.26,49.73],[98.86,52.05],[103.68,50.09],[106.89,50.27],[108.48,49.28],[110.66,49.13],[114.36,50.25],[116.68,49.89]],[[124.27,39.93],[126.87,41.82],[128.21,41.47],[128.05,41.99],[129.99,42.99],[130.64,42.4]],[[128.35,38.61],[126.17,37.75]],[[124.97,-8.89],[125.09,-9.39]],[[141.0,-2.6],[141.03,-9.12]],[[11.91,-5.04],[13.0,-4.78]],[[19.01,44.86],[19.22,43.52]],[[48.58,41.81],[47.82,41.15],[46.4,41.86]],[[42.35,37.23],[41.29,36.36],[41.01,34.42],[38.79,33.38]],[[35.82,33.28],[35.55,33.26]],[[32.73,35.14],[33.97,35.06]],[[19.22,43.52],[20.26,42.81]],[[44.97,41.25],[46.51,38.77]],[[-122.84,49],[-94.82,49.39],[-91.64,48.14],[-88.38,48.3],[-82.55,45.35],[-82.69,41.68],[-74.87,45.0],[-71.51,45.01],[-69.24,47.45],[-67.79,47.07],[-67.14,45.14]],[[38.41,18.0],[36.85,16.96],[36.43,14.42]],[[47.79,8.0],[44.96,5.0],[41.86,3.92]],[[41.86,3.92],[38.12,3.6],[35.82,4.78]],[[39.2,-4.68],[33.9,-0.95]],[[-8.67,27.66],[-11.39,26.88],[-14.75,21.5],[-17.0,21.42]],[[11.03,58.86],[12.3,60.12],[11.93,63.13],[12.58,64.07],[13.57,64.05],[16.77,68.01],[20.65,69.11]],[[40.32,-10.32],[37.47,-11.57],[34.56,-11.52]],[[32.76,-9.23],[33.49,-10.53],[32.69,-13.71],[33.21,-13.97]],[[34.56,-11.52],[34.56,-13.58],[35.69,-14.61],[35.03,-16.8],[34.46,-14.61],[33.21,-13.97]],[[30.83,3.51],[31.17,2.2],[29.88,0.6],[29.58,-1.34]],[[30.47,-2.41],[30.75,-3.36],[29.34,-4.5]],[[20.26,42.81],[20.81,43.27],[21.58,42.25]],[[-71.71,18.05],[-71.71,19.71]],[[48.95,11.41],[48.94,9.45],[47.79,8.0]],[[-69.59,-17.58],[-70.37,-18.35]],[[34.92,29.5],[34.27,31.22]],[[35.72,32.71],[35.55,32.4]],[[35.82,33.28],[36.61,34.2],[36.0,34.64]],[[35.55,32.4],[35.4,31.48]],[[35.7,32.72],[35.82,33.28]],[[29.0,9.6],[30.0,10.29],[31.35,9.81],[32.74,12.25],[33.96,9.46]],[[23.89,8.62],[25.07,10.27],[27.83,9.6]],[[34.01,4.25],[30.83,3.51]],[[27.83,9.6],[29.0,9.6]],[[35.9,4.61],[34.01,4.25]],[[35.82,4.78],[35.3,5.51]],[[33.94,-9.69],[32.76,-9.23]],[[34.56,-11.52],[33.94,-9.69]],[[-2.17,35.17],[-1.31,32.26]],[[-1.31,32.26],[-8.67,28.84],[-8.67,27.66]],[[75.16,37.13],[75.9,36.67]],[[78.81,33.51],[79.21,32.99]],[[77.84,35.49],[78.81,33.51]],[[91.7,27.77],[96.12,29.45],[96.25,28.41],[97.33,28.26]],[[-57.15,5.97],[-58.04,4.06],[-57.6,3.33]],[[-53.96,5.76],[-54.18,3.19]],[[-57.6,3.33],[-56.54,1.9]],[[-54.18,3.19],[-54.52,2.31]],[[42.78,10.93],[43.68,9.18],[47.79,8.0]],[[41.86,3.92],[40.98,2.78],[41.59,-1.68]],[[77.84,35.49],[77.29,35.05]],[[33.44,45.97],[35.01,45.74]],[[75.26,32.27],[71.78,27.91],[70.62,27.99],[69.51,26.94],[71.04,24.36],[68.18,23.69]],[[-60.73,5.2],[-63.09,3.77],[-64.82,4.06],[-64.27,2.5],[-63.37,2.2],[-64.2,1.49],[-65.55,0.79],[-66.88,1.25]],[[44.79,39.71],[46.14,38.74]],[[46.51,38.77],[46.14,38.74]],[[44.97,41.25],[43.58,41.09]],[[43.58,41.09],[44.79,39.71]],[[44.79,39.71],[44.11,39.43],[44.77,37.17]],[[44.77,37.17],[42.35,37.23]],[[42.35,37.23],[36.74,36.82],[36.15,35.82]],[[38.79,33.38],[36.83,32.31],[35.7,32.72]],[[39.2,32.16],[37.0,31.51],[38.0,30.51],[37.5,30.0],[34.96,29.36]],[[46.57,29.1],[44.71,29.18],[39.2,32.16]],[[52,19],[55,20],[55.67,22],[55.21,22.71]],[[55.21,22.71],[52.0,23.0],[51.58,24.25]],[[61.21,35.65],[60.54,32.98],[61.78,30.74],[60.87,29.83]],[[60.87,29.83],[63.32,26.76],[61.87,26.24],[61.5,25.08]],[[67.83,37.15],[66.52,37.36]],[[66.52,37.36],[66.55,37.97],[58.63,42.75],[57.1,41.32],[55.97,41.31]],[[74.98,37.42],[75.16,37.13]],[[75.16,37.13],[71.26,36.07],[71.61,35.15],[70.88,33.99],[69.93,34.02],[70.32,33.36],[69.32,31.9],[66.94,31.3],[66.35,29.89],[62.55,29.32],[60.87,29.83]],[[73.68,39.43],[69.46,39.53],[71.01,40.24]],[[87.36,49.22],[85.77,48.46],[85.16,47.0],[83.18,47.33],[82.46,45.54],[79.97,44.92],[80.87,43.18],[80.26,42.35]],[[80.26,42.35],[74.21,43.3],[73.49,42.5],[70.96,42.27]],[[70.96,42.27],[68.26,40.66],[66.71,41.17],[66.1,43.0],[64.9,43.73],[62.01,43.5],[58.5,45.59],[55.93,45.0],[55.97,41.31]],[[55.97,41.31],[54.08,42.32],[52.5,41.78]],[[76.65,35.79],[77.84,35.49]],[[81.11,30.18],[80.09,28.79],[83.3,27.36],[88.06,26.41],[88.12,27.88]],[[88.81,27.3],[92.03,26.84],[91.7,27.77]],[[88.12,27.88],[88.73,28.09],[88.81,27.3]],[[92.67,22.04],[92.15,23.63],[91.71,22.99],[91.16,23.5],[92.38,24.98],[89.92,25.27],[88.56,26.45],[88.21,25.77],[88.93,25.24],[88.08,24.5],[89.03,22.06]],[[101.18,21.44],[100.12,20.42]],[[100.12,20.42],[98.25,19.71],[97.38,18.45],[98.9,16.18],[98.19,15.12],[99.59,11.89],[98.55,9.93]],[[102.17,22.46],[103.2,20.77],[104.44,20.76],[104.82,19.89],[103.9,19.27],[107.31,15.91],[107.38,14.2]],[[107.38,14.2],[105.22,14.27]],[[130.64,42.4],[130.78,42.22]],[[27.29,57.47],[28.18,56.17]],[[28.18,56.17],[26.49,55.62]],[[31.79,52.1],[30.56,51.32],[23.53,51.58]],[[26.49,55.62],[25.54,54.28],[23.48,53.91]],[[20.65,69.11],[24.74,68.65],[27.73,70.16],[29.02,69.77],[28.59,69.06]],[[28.59,69.06],[31.1,69.56]],[[26.62,48.22],[28.67,48.12],[29.91,46.67],[28.23,45.49]],[[28.23,45.49],[29.6,45.29]],[[22.66,44.23],[20.22,46.13]],[[21.02,40.84],[20.59,41.86]],[[21.58,42.25],[20.59,41.86]],[[20.59,41.86],[20.07,42.59]],[[20.07,42.59],[19.37,41.88]],[[22.36,42.32],[21.58,42.25]],[[20.26,42.81],[20.07,42.59]],[[19.22,43.52],[18.56,42.65]],[[19.01,44.86],[18.83,45.91]],[[15.02,51.11],[12.24,50.27],[13.6,48.88]],[[13.6,48.88],[12.93,47.47],[9.59,47.53]],[[9.59,47.53],[7.47,47.62]],[[16.96,48.6],[13.6,48.88]],[[16.98,48.12],[16.2,46.85]],[[16.2,46.85],[13.81,46.51]],[[13.81,46.51],[13.94,45.59]],[[10.44,46.89],[6.84,45.99]],[[7.47,47.62],[6.04,46.73],[6.84,45.99]],[[6.84,45.99],[7.44,43.69]],[[6.04,50.13],[5.67,49.53]],[[5.67,49.53],[2.51,51.15]],[[6.16,50.8],[3.31,51.35]],[[-4.92,24.97],[-6.45,24.96],[-5.54,15.5],[-11.67,15.39],[-12.17,14.62]],[[-12.17,14.62],[-14.58,16.6],[-16.46,16.14]],[[9.48,30.31],[9.32,26.09],[10.3,24.38],[12.0,23.47]],[[12.0,23.47],[4.27,19.16]],[[4.27,19.16],[3.16,19.06],[3.15,19.69],[-4.92,24.97]],[[14.85,22.86],[14.14,22.49],[12.0,23.47]],[[25,22],[25,20.0],[23.84,19.58]],[[23.84,19.58],[15.86,23.41],[14.85,22.86]],[[22.86,11.14],[17.96,7.89],[15.28,7.42]],[[15.28,7.42],[13.95,9.55],[15.47,9.98],[14.5,12.86]],[[14.5,12.86],[14.18,12.48]],[[14.18,12.48],[14.42,11.57],[11.75,6.98],[9.23,6.44],[8.5,4.77]],[[-11.51,12.44],[-13.7,12.59]],[[-8.03,10.21],[-8.44,7.69]],[[-8.44,7.69],[-9.21,7.31],[-10.23,8.41]],[[-10.23,8.41],[-11.12,10.05],[-13.25,8.9]],[[0.37,14.93],[-4.01,13.47],[-5.4,10.37]],[[-5.4,10.37],[-8.03,10.21]],[[2.15,11.94],[0.9,11.0]],[[0.9,11.0],[0.02,11.02]],[[-2.83,9.64],[-5.4,10.37]],[[0.02,11.02],[-2.94,10.96],[-2.83,9.64]],[[3.61,11.66],[2.69,6.26]],[[16.01,2.27],[15.94,1.73],[13.08,2.27]],[[13.08,2.27],[11.28,2.26]],[[11.28,2.26],[9.65,2.28]],[[23.81,8.67],[27.37,5.23]],[[27.37,5.23],[24.41,5.11],[22.41,4.03],[19.47,5.03],[18.45,3.5]],[[36.43,14.42],[33.96,9.58]],[[33.96,9.58],[32.95,7.78],[35.3,5.51]],[[42.35,12.54],[43.08,12.7]],[[42.78,10.93],[41.76,11.05],[42.35,12.54]],[[33.9,-0.95],[35.04,1.91],[34.01,4.25]],[[30.83,3.51],[27.37,5.23]],[[18.45,3.5],[17.64,-0.42],[16.01,-3.54],[14.58,-4.97],[13.0,-4.78]],[[13.0,-4.78],[12.18,-5.79]],[[29.58,-1.34],[29.02,-2.84]],[[29.02,-2.84],[29.34,-4.5]],[[29.34,-4.5],[30.74,-8.34]],[[30.74,-8.34],[29.0,-8.41],[28.45,-9.16],[28.37,-11.79],[29.62,-12.18],[29.7,-13.26],[27.16,-11.61],[23.91,-10.93]],[[23.91,-10.93],[22.16,-11.08],[21.73,-7.29],[20.09,-6.94],[19.02,-7.99],[17.47,-8.07],[16.33,-5.88],[12.32,-6.1]],[[30.47,-2.41],[29.02,-2.84]],[[30.42,-1.13],[33.9,-0.95]],[[32.76,-9.23],[30.74,-8.34]],[[33.21,-13.97],[30.18,-14.8],[30.27,-15.51]],[[30.27,-15.51],[27.04,-17.94],[25.08,-17.66]],[[23.22,-17.52],[11.73,-17.3]],[[24.93,-17.72],[20.91,-18.25],[20.88,-21.81],[19.9,-21.85],[19.9,-24.77]],[[29.43,-22.09],[25.66,-25.49],[23.31,-25.27],[21.61,-26.73],[20.89,-26.83],[19.9,-24.77]],[[31.19,-22.25],[29.43,-22.09]],[[32.07,-26.73],[31.84,-25.84]],[[31.84,-25.84],[31.19,-22.25]],[[-89.14,17.81],[-88.3,18.5]],[[-89.35,14.42],[-88.23,15.73]],[[-66.88,1.25],[-67.54,2.04],[-69.82,1.71],[-69.22,0.99],[-70.02,0.54],[-69.42,-1.12],[-69.89,-4.3]],[[-69.89,-4.3],[-70.69,-3.74],[-70.05,-2.73],[-73.07,-2.31],[-75.37,-0.15]],[[-75.37,-0.15],[-78.86,1.38]],[[-67.11,-22.74],[-67.83,-22.87],[-68.44,-19.41],[-69.59,-17.58]],[[-58.17,-20.18],[-59.12,-19.36],[-61.79,-19.63],[-62.69,-22.25]],[[-54.63,-25.74],[-53.63,-26.12],[-53.65,-26.92],[-57.63,-30.22]],[[-57.63,-30.22],[-53.79,-32.05],[-53.37,-33.77]],[[-69.59,-17.58],[-68.67,-12.56],[-69.53,-10.95]],[[13.32,13.56],[14.18,12.48]],[[6.19,49.46],[5.67,49.53]],[[46.14,38.74],[44.79,39.71]],[[46.51,38.77],[48.06,39.58],[48.88,38.32]],[[-13.7,12.59],[-16.68,12.38]],[[19.9,-24.77],[19.89,-28.46],[18.46,-29.05],[16.82,-28.08],[16.34,-28.58]],[[-62.69,-22.25],[-63.99,-21.99],[-64.38,-22.8],[-66.27,-21.83],[-67.11,-22.74]],[[-69.53,-10.95],[-65.34,-9.76],[-65.4,-11.57],[-60.5,-13.78],[-60.16,-16.26],[-58.24,-16.3],[-57.5,-18.17],[-58.17,-20.18]],[[-57.85,-19.97],[-58.17,-20.18]],[[75.9,36.67],[76.65,35.79]],[[79.21,32.99],[79.18,32.48]],[[79.18,32.48],[78.55,32.27]],[[78.55,32.27],[78.65,31.85]],[[78.65,31.85],[78.88,31.43]],[[78.88,31.43],[79.37,31.11]],[[79.37,31.11],[79.81,30.84]],[[79.81,30.84],[80.26,30.61]],[[80.26,30.61],[81.11,30.18]],[[36.7,45.61],[36.64,44.95]],[[87.36,49.22],[90.28,47.69],[90.95,45.29],[95.31,44.24],[96.35,42.73],[100.85,42.66],[104.97,41.6],[110.41,42.87],[111.83,43.74],[111.35,44.46],[111.87,45.1],[113.46,44.81],[117.42,46.67],[119.66,46.69],[118.06,48.07],[115.74,47.73],[116.68,49.89]],[[116.68,49.89],[119.29,50.14],[121.0,53.25],[123.57,53.46],[125.95,52.79],[127.66,49.76],[129.4,49.44],[130.99,47.79],[135.03,48.48],[133.1,45.14],[131.03,44.97],[130.64,42.4]],[[35.55,33.26],[35.13,33.09]],[[75.14,34.6],[73.75,34.32],[74.45,32.76]],[[77.29,35.05],[75.14,34.6]]];
const GEO_STATES=[[[-84.32,34.99],[-81.66,36.61]],[[-74.7,41.36],[-75.07,39.98]],[[-71.52,45.01],[-72.47,42.73]],[[-82.59,38.42],[-82.6,38.43]],[[-82.61,38.45],[-82.59,38.42]],[[-81.97,37.54],[-82.59,38.42]],[[-81.97,37.54],[-83.67,36.61]],[[-89.74,31.0],[-89.52,30.19]],[[-96.56,45.94],[-97.23,48.99]],[[-94.05,33.55],[-94.48,33.65]],[[-75.42,39.82],[-75.78,39.72]],[[-81.09,35.16],[-81.05,35.07]],[[-82.78,35.09],[-82.36,35.2]],[[-120,60.0],[-119.89,53.52],[-114.99,50.55],[-114.06,48.99]],[[-123.82,60.0],[-124.58,60.95],[-126.86,60.77],[-127.17,61.46],[-129.25,62.15],[-130.12,63.79],[-132.59,64.79],[-132.34,65.98],[-133.62,65.97],[-134.06,67.0],[-136.17,67.02],[-136.44,68.9]],[[-68.38,47.59],[-69.05,47.29]],[[-67.61,48.0],[-66.7,48.02]],[[-120.0,42.0],[-124.23,42.0]],[[-111.05,44.5],[-112.85,44.4],[-113.8,45.6],[-114.53,45.58],[-114.34,46.66],[-115.71,47.45],[-116.05,48.99]],[[-111.05,44.5],[-111.05,42.0]],[[-111.05,44.5],[-111.05,45.0],[-104.04,45.0]],[[-117.02,42.0],[-120.0,42.0]],[[-117.02,42.0],[-114.04,42.0]],[[-111.05,42.0],[-114.04,42.0]],[[-111.05,42.0],[-111.05,41.0],[-109.05,41.0]],[[-114.04,42.0],[-114.04,37.0]],[[-114.04,37.0],[-109.05,37.0]],[[-109.05,37.0],[-109.05,31.33]],[[-109.05,41.0],[-104.02,41.0]],[[-109.05,41.0],[-109.05,37.0]],[[-103.0,37.0],[-109.05,37.0]],[[-104.01,45.94],[-104.03,48.99]],[[-104.04,45.0],[-104.01,45.94]],[[-104.03,43.0],[-104.04,45.0]],[[-96.56,45.94],[-104.01,45.94]],[[-104.02,41.0],[-104.03,43.0]],[[-102.02,40.0],[-102.03,41.0],[-104.02,41.0]],[[-102.01,37.0],[-102.02,40.0]],[[-95.35,40.0],[-102.02,40.0]],[[-103.0,36.5],[-103.0,37.0]],[[-102.01,37.0],[-103.0,37.0]],[[-94.48,33.65],[-99.69,34.42],[-100.0,36.5],[-103.0,36.5]],[[-94.62,37.0],[-102.01,37.0]],[[-96.45,43.5],[-96.48,42.51]],[[-94.62,39.09],[-94.62,37.0]],[[-94.62,39.12],[-94.62,39.09]],[[-94.62,37.0],[-94.62,36.5]],[[-95.77,40.6],[-91.44,40.38]],[[-94.04,33.01],[-94.05,33.55]],[[-94.62,36.5],[-94.48,33.65]],[[-94.62,36.5],[-90.16,36.5],[-90.38,35.99],[-89.7,36.0]],[[-80.52,40.65],[-80.52,42.32]],[[-79.48,39.72],[-80.52,39.72],[-80.52,40.65]],[[-93.79,29.98],[-94.04,33.01]],[[-94.04,33.01],[-91.15,33.02]],[[-90.29,35.0],[-88.17,35.0]],[[-85.01,31.0],[-87.59,31.0],[-87.49,30.38]],[[-83.1,35.0],[-83.1,35.0]],[[-84.32,34.99],[-85.62,35.0]],[[-83.11,35.0],[-84.32,34.99]],[[-82.78,35.09],[-83.11,35.0]],[[-81.05,35.07],[-78.56,33.88]],[[-82.36,35.2],[-81.09,35.16]],[[-71.8,42.01],[-71.23,41.71]],[[-73.48,42.06],[-71.8,42.01]],[[-71.8,42.01],[-71.84,41.34]],[[-81.97,37.54],[-80.46,37.43],[-79.64,38.57],[-77.73,39.35]],[[-79.48,39.72],[-75.78,39.72]],[[-79.48,39.72],[-79.49,39.21]],[[-75.78,39.72],[-75.71,38.46],[-75.04,38.46]],[[-75.66,37.95],[-75.22,38.04]],[[-77.02,38.81],[-77.12,38.94]],[[-74.7,41.36],[-75.35,42.0],[-79.76,42.0],[-79.76,42.54]],[[-73.25,42.75],[-73.48,42.06]],[[-73.48,42.06],[-73.63,40.99]],[[-74.7,41.36],[-73.91,40.99]],[[-72.47,42.73],[-73.25,42.75]],[[-73.25,42.75],[-73.35,45.01]],[[-70.81,42.88],[-72.47,42.73]],[[-70.73,43.07],[-71.08,45.29]],[[-96.45,43.5],[-96.56,45.94]],[[-91.25,43.5],[-96.45,43.5]],[[-84.8,41.7],[-83.12,41.95]],[[-89.96,47.29],[-89.5,48.0]],[[-87.22,41.76],[-87.04,42.49]],[[-90.65,42.51],[-87.04,42.49]],[[-84.82,39.09],[-84.8,41.7]],[[-87.22,41.76],[-84.8,41.7]],[[-87.04,42.49],[-87.03,44.09],[-86.26,45.23],[-87.65,45.12],[-88.15,45.95],[-90.12,46.34],[-89.96,47.29]],[[-91.66,31.0],[-89.74,31.0]],[[-89.49,36.5],[-89.56,36.5]],[[-114.61,34.99],[-120.0,39.0],[-120.0,42.0]],[[-67.61,48.0],[-68.38,47.59]],[[-123.82,60.0],[-139.06,60.0]],[[-120,60.0],[-123.82,60.0]],[[-64.03,46.01],[-64.31,45.84]],[[-64.61,60.31],[-64.32,59.02],[-64.85,58.95],[-63.5,58.75],[-64.39,58.14],[-63.6,57.72],[-64.12,56.3],[-63.11,55.34],[-63.7,54.62],[-67.41,55.07],[-67.76,54.06],[-67.07,52.75],[-66.43,53.01],[-66.41,52.18],[-64.6,51.6],[-63.72,53.11],[-63.76,52.01],[-57.1,52.0],[-57.1,51.44]],[[-102.0,60.0],[-102.0,64.23],[-109.22,64.81],[-120.68,68.0],[-120.68,69.65],[-110.0,70.0],[-110.0,78.69]],[[-102.0,60.0],[-110.0,60.0]],[[-120,60.0],[-110.0,60.0]],[[-110.0,60.0],[-110.0,48.99]],[[-88.95,56.85],[-95.15,52.82],[-95.16,49.37]],[[-102.0,60.0],[-94.77,60.0]],[[-102.0,60.0],[-101.37,48.99]],[[-116.9,46.0],[-122.2,45.59],[-123.22,46.15]],[[-116.9,46.0],[-117.04,48.99]],[[-117.02,42.0],[-117.2,44.44],[-116.48,45.64],[-116.9,46.0]],[[-114.61,34.99],[-114.13,34.29],[-114.72,32.72]],[[-114.61,34.99],[-114.74,36.01],[-114.04,36.18],[-114.04,37.0]],[[-103.0,36.5],[-103.07,32.0],[-106.45,31.77]],[[-95.35,40.0],[-94.62,39.12]],[[-95.77,40.6],[-95.35,40.0]],[[-96.48,42.51],[-95.77,40.6]],[[-96.48,42.51],[-104.03,43.0]],[[-91.15,33.02],[-91.66,31.0]],[[-90.29,35.0],[-91.15,33.02]],[[-89.7,36.0],[-90.29,35.0]],[[-89.56,36.5],[-89.7,36.0]],[[-89.49,36.5],[-89.56,36.5]],[[-89.45,36.5],[-89.49,36.5]],[[-89.15,36.99],[-89.45,36.5]],[[-91.44,40.38],[-89.15,36.99]],[[-90.65,42.51],[-90.18,41.88],[-91.44,40.38]],[[-91.25,43.5],[-90.65,42.51]],[[-91.25,43.5],[-92.77,44.73],[-92.9,45.66],[-92.13,46.76],[-89.96,47.29]],[[-88.04,37.79],[-89.15,36.99]],[[-84.82,39.09],[-86.02,37.98],[-88.04,37.79]],[[-82.61,38.45],[-84.82,39.09]],[[-80.52,40.65],[-80.87,39.66],[-82.61,38.45]],[[-88.04,37.79],[-87.22,41.76]],[[-88.17,35.0],[-88.4,30.37]],[[-85.62,35.0],[-88.17,35.0]],[[-83.67,36.61],[-89.45,36.5]],[[-81.66,36.61],[-83.67,36.61]],[[-75.86,36.55],[-81.66,36.61]],[[-85.01,31.0],[-82.11,30.37],[-81.5,30.73]],[[-85.01,31.0],[-85.62,35.0]],[[-83.11,35.0],[-80.87,32.03]],[[-77.12,38.94],[-77.02,38.81]],[[-77.73,39.35],[-77.12,38.94]],[[-79.49,39.21],[-77.73,39.35]],[[-79.52,51.54],[-79.36,47.02],[-76.55,45.54],[-74.34,45.21]]];
const GEO_LANDMASS=[[[-59.57,-80.04],[-60.16,-81.0],[-64.49,-80.92],[-66.29,-80.26],[-61.88,-80.39],[-60.61,-79.63],[-59.57,-80.04]],[[-159.21,-79.5],[-161.13,-79.63],[-163.71,-78.6],[-161.25,-78.38],[-159.21,-79.5]],[[-45.15,-78.05],[-43.92,-78.48],[-43.33,-80.03],[-50.48,-81.03],[-54.16,-80.63],[-50.99,-79.61],[-48.66,-78.05],[-45.15,-78.05]],[[-98.98,-71.93],[-96.79,-71.95],[-96.2,-72.52],[-100.78,-72.5],[-102.33,-71.89],[-98.98,-71.93]],[[-68.45,-70.96],[-68.78,-72.17],[-71.08,-72.5],[-72.39,-72.48],[-71.9,-72.09],[-74.19,-72.37],[-75.01,-71.66],[-72.07,-71.19],[-71.74,-69.51],[-70.25,-68.88],[-68.45,-70.96]],[[-58.61,-64.15],[-62.02,-64.8],[-62.65,-65.48],[-62.12,-66.19],[-63.75,-66.5],[-65.67,-67.95],[-63.2,-69.23],[-61.81,-70.72],[-60.83,-73.7],[-64.35,-75.26],[-70.6,-76.63],[-77.24,-76.71],[-73.66,-77.91],[-77.93,-78.38],[-78.02,-79.18],[-75.36,-80.26],[-59.69,-82.38],[-58.22,-83.22],[-49.76,-81.73],[-42.81,-82.08],[-40.77,-81.36],[-28.55,-80.34],[-29.69,-79.26],[-35.64,-79.46],[-35.78,-78.34],[-28.88,-76.67],[-17.52,-75.13],[-15.7,-74.5],[-15.41,-74.11],[-16.47,-73.87],[-15.45,-73.15],[-12.29,-72.4],[-10.3,-71.27],[-7.42,-71.7],[-6.87,-70.93],[-4.34,-71.46],[-0.66,-71.23],[-0.23,-71.64],[7.74,-69.89],[9.53,-70.01],[10.82,-70.83],[13.42,-69.97],[15.13,-70.4],[19.26,-69.89],[22.57,-70.7],[27.09,-70.46],[31.99,-69.66],[33.87,-68.5],[38.65,-69.78],[54.53,-65.82],[56.36,-65.97],[58.74,-67.29],[61.43,-67.95],[64.05,-67.41],[68.89,-67.93],[69.67,-69.23],[67.81,-70.31],[69.07,-70.68],[67.95,-71.85],[69.87,-72.26],[71.02,-72.09],[73.86,-69.87],[77.64,-69.46],[79.11,-68.33],[82.78,-67.21],[86.75,-67.15],[87.99,-66.21],[89.67,-67.15],[95.78,-67.39],[99.72,-67.25],[102.83,-65.56],[106.18,-66.93],[113.6,-65.88],[115.6,-66.7],[119.83,-67.27],[123.22,-66.48],[128.8,-66.76],[134.76,-66.21],[135.07,-65.31],[137.46,-66.95],[145.49,-66.92],[146.65,-67.9],[148.84,-68.39],[152.5,-68.87],[154.28,-68.56],[161.57,-70.58],[167.31,-70.83],[171.21,-71.7],[169.29,-73.66],[166.09,-74.38],[163.57,-76.24],[163.49,-77.07],[164.74,-78.18],[167.0,-78.75],[161.77,-79.16],[159.79,-80.95],[169.4,-83.83],[180,-84.71],[180,-90],[-180,-90],[-180,-84.71],[-179.06,-84.14],[-174.38,-84.53],[-169.95,-83.88],[-158.07,-85.37],[-148.53,-85.61],[-143.11,-85.04],[-142.89,-84.57],[-153.59,-83.69],[-152.86,-82.04],[-156.84,-81.1],[-150.65,-81.34],[-146.42,-80.34],[-149.53,-79.36],[-155.33,-79.06],[-158.05,-78.03],[-158.37,-76.89],[-151.33,-77.4],[-146.1,-76.48],[-146.2,-75.38],[-135.21,-74.3],[-121.07,-74.52],[-113.94,-73.71],[-112.3,-74.71],[-111.26,-74.42],[-107.56,-75.18],[-100.65,-75.3],[-100.12,-74.87],[-102.55,-74.11],[-103.68,-72.62],[-96.34,-73.62],[-90.09,-73.32],[-89.23,-72.56],[-81.47,-73.85],[-80.3,-73.13],[-74.89,-73.87],[-67.37,-72.48],[-67.25,-71.64],[-68.54,-69.72],[-67.43,-68.15],[-67.74,-67.33],[-63.0,-64.64],[-58.59,-63.39],[-57.22,-63.53],[-58.61,-64.15]],[[-67.75,-53.85],[-65.05,-54.7],[-65.5,-55.2],[-66.96,-54.9],[-68.15,-55.61],[-69.23,-55.5],[-72.26,-54.5],[-74.66,-52.84],[-71.11,-54.07],[-69.35,-52.52],[-68.63,-52.64],[-67.75,-53.85]],[[-58.55,-51.1],[-57.75,-51.55],[-58.05,-51.9],[-60.7,-52.3],[-61.2,-51.85],[-58.55,-51.1]],[[145.4,-40.79],[148.29,-40.88],[147.91,-43.21],[146.05,-43.55],[144.72,-41.16],[144.74,-40.7],[145.4,-40.79]],[[173.02,-40.92],[174.25,-41.35],[172.71,-43.37],[173.08,-43.85],[171.45,-44.24],[170.62,-45.91],[169.33,-46.64],[166.68,-46.22],[167.05,-45.11],[170.52,-43.03],[172.1,-40.96],[172.8,-40.49],[173.02,-40.92]],[[174.61,-36.16],[175.34,-37.21],[175.36,-36.53],[176.76,-37.88],[178.52,-37.7],[177.97,-39.17],[177.21,-39.15],[176.01,-41.29],[175.24,-41.69],[174.65,-41.28],[175.23,-40.46],[174.9,-39.91],[173.82,-39.51],[174.57,-38.8],[174.7,-37.38],[172.64,-34.53],[174.33,-35.27],[174.61,-36.16]],[[167.12,-22.16],[165.47,-21.68],[164.03,-20.11],[167.12,-22.16]],[[50.06,-13.56],[50.38,-15.71],[49.67,-15.71],[49.77,-16.88],[47.1,-24.94],[45.41,-25.6],[44.04,-24.99],[43.25,-22.06],[44.37,-20.07],[43.96,-17.41],[44.45,-16.22],[46.31,-15.78],[47.71,-14.59],[49.19,-12.04],[50.06,-13.56]],[[143.56,-13.76],[143.92,-14.55],[144.56,-14.17],[145.37,-14.98],[146.39,-18.96],[148.85,-20.39],[149.68,-22.34],[150.73,-22.4],[150.9,-23.46],[153.14,-26.07],[153.57,-28.11],[152.89,-31.64],[150.33,-35.67],[150.0,-37.43],[146.32,-39.04],[144.88,-38.42],[145.03,-37.9],[143.61,-38.81],[140.64,-38.02],[139.57,-36.14],[138.12,-35.61],[138.21,-34.38],[136.83,-35.26],[137.89,-33.64],[137.81,-32.9],[135.99,-34.89],[135.21,-34.48],[134.27,-32.62],[131.33,-31.5],[126.15,-32.22],[124.22,-32.96],[123.66,-33.89],[119.89,-33.98],[118.02,-35.06],[116.63,-35.03],[115.03,-34.2],[115.71,-33.26],[115.69,-31.61],[113.34,-26.12],[113.78,-26.55],[113.44,-25.62],[114.23,-26.3],[113.39,-24.38],[114.15,-21.76],[114.23,-22.52],[116.71,-20.7],[120.86,-19.68],[123.01,-16.41],[123.43,-17.27],[123.86,-17.07],[123.5,-16.6],[123.82,-16.11],[124.26,-16.33],[125.69,-14.23],[127.07,-13.82],[128.36,-14.87],[129.62,-14.97],[129.41,-14.42],[130.62,-12.54],[132.58,-12.11],[131.82,-11.27],[132.36,-11.13],[135.3,-12.25],[136.49,-11.86],[136.95,-12.35],[135.96,-13.32],[135.5,-15.0],[140.22,-17.71],[141.27,-16.39],[141.69,-12.41],[142.52,-10.67],[143.56,-13.76]],[[124.44,-10.14],[123.46,-10.24],[125.09,-8.66],[127.34,-8.4],[124.44,-10.14]],[[108.62,-6.78],[110.54,-6.88],[110.76,-6.47],[115.71,-8.37],[114.56,-8.75],[105.37,-6.85],[106.05,-5.9],[108.62,-6.78]],[[151.98,-5.48],[150.24,-6.32],[148.32,-5.75],[149.85,-5.51],[150.14,-5.0],[150.24,-5.53],[150.81,-5.46],[151.65,-4.76],[151.54,-4.17],[152.34,-4.31],[151.98,-5.48]],[[153.14,-4.5],[152.83,-4.77],[152.41,-3.79],[150.66,-2.74],[152.24,-3.24],[153.14,-4.5]],[[134.14,-1.15],[134.42,-2.77],[135.46,-3.37],[136.29,-2.31],[138.33,-1.7],[144.58,-3.86],[145.98,-5.47],[147.65,-6.08],[147.89,-6.61],[146.97,-6.72],[147.19,-7.39],[150.69,-10.58],[147.91,-10.13],[146.05,-8.07],[144.74,-7.63],[143.29,-8.25],[143.41,-8.98],[142.63,-9.33],[139.13,-8.1],[137.61,-8.41],[138.67,-7.32],[137.93,-5.39],[133.66,-3.54],[132.98,-4.11],[131.99,-2.82],[133.7,-2.21],[132.23,-2.21],[130.52,-0.94],[132.38,-0.37],[134.14,-1.15]],[[125.24,1.42],[123.69,0.24],[120.18,0.24],[120.04,-0.52],[120.94,-1.41],[123.34,-0.62],[121.51,-1.9],[123.16,-5.34],[122.24,-5.28],[122.72,-4.46],[121.49,-4.57],[120.97,-2.63],[120.31,-2.93],[120.43,-5.53],[119.37,-5.38],[119.5,-3.49],[118.77,-2.8],[120.04,0.57],[120.89,1.31],[122.93,0.88],[125.24,1.42]],[[105.82,-5.85],[104.71,-5.87],[102.58,-4.22],[98.6,1.82],[95.29,5.48],[97.48,5.25],[100.64,2.1],[101.66,2.08],[103.84,0.1],[103.44,-0.71],[106.11,-3.06],[105.82,-5.85]],[[117.88,1.83],[119.0,0.9],[117.81,0.78],[117.52,-0.8],[116.56,-1.49],[116.15,-4.01],[116.0,-3.66],[114.86,-4.11],[113.26,-3.12],[112.07,-3.48],[111.7,-2.99],[110.22,-2.93],[110.07,-1.59],[109.09,-0.46],[109.07,1.34],[109.66,2.01],[111.17,1.85],[111.37,2.7],[113.0,3.1],[116.73,6.92],[119.18,5.41],[117.31,3.23],[117.88,1.83]],[[126.38,8.41],[126.54,7.19],[126.2,6.27],[125.83,7.29],[125.36,6.79],[125.4,5.58],[124.22,6.16],[124.24,7.36],[123.61,7.83],[121.92,7.19],[123.49,8.69],[123.84,8.24],[125.47,8.99],[125.41,9.76],[126.22,9.29],[126.38,8.41]],[[81.22,6.2],[80.35,5.97],[79.87,6.76],[80.15,9.82],[81.79,7.52],[81.22,6.2]],[[118.5,9.32],[117.17,8.37],[119.51,11.37],[119.69,10.55],[118.5,9.32]],[[121.32,18.5],[122.25,18.48],[122.52,17.09],[121.66,15.93],[121.73,14.33],[123.95,13.78],[124.08,12.54],[122.93,13.55],[122.67,13.19],[122.03,13.78],[120.63,13.86],[120.99,14.53],[120.07,14.97],[119.88,16.36],[120.29,16.03],[120.72,18.51],[121.32,18.5]],[[-72.58,19.87],[-69.95,19.65],[-68.32,18.61],[-68.69,18.21],[-70.67,18.43],[-71.4,17.6],[-72.37,18.21],[-74.46,18.34],[-72.33,18.67],[-73.42,19.64],[-72.58,19.87]],[[110.34,18.68],[109.48,18.2],[108.66,18.51],[108.63,19.37],[110.79,20.08],[110.34,18.68]],[[-79.68,22.77],[-74.18,20.28],[-77.76,19.86],[-77.09,20.41],[-78.14,20.74],[-78.72,21.6],[-82.17,22.39],[-81.8,22.64],[-84.97,21.9],[-82.27,23.19],[-79.68,22.77]],[[121.18,22.79],[120.75,21.97],[120.11,23.56],[121.5,25.3],[121.95,25.0],[121.18,22.79]],[[15.52,38.23],[15.1,36.62],[12.43,37.61],[12.57,38.13],[15.52,38.23]],[[140.98,37.14],[140.25,35.14],[137.22,34.61],[135.79,33.46],[135.12,33.85],[135.08,34.6],[130.99,33.89],[132.0,33.15],[131.33,31.45],[130.69,31.03],[130.2,31.42],[130.45,32.32],[129.41,33.3],[132.62,35.43],[135.68,35.53],[136.72,37.3],[137.39,36.83],[139.43,38.22],[140.05,39.44],[139.88,40.56],[140.31,41.2],[141.37,41.38],[141.88,39.18],[140.96,38.17],[140.98,37.14]],[[143.91,44.17],[145.32,44.38],[145.54,43.26],[144.06,42.99],[143.18,42.0],[141.61,42.68],[141.07,41.58],[139.96,41.57],[139.82,42.56],[140.31,43.33],[141.38,43.39],[141.97,45.55],[143.91,44.17]],[[-123.51,48.51],[-125.66,48.83],[-128.06,49.99],[-128.36,50.77],[-125.76,50.3],[-123.51,48.51]],[[-56.13,50.69],[-56.8,49.81],[-56.14,50.15],[-55.47,49.94],[-55.82,49.59],[-53.48,49.25],[-53.79,48.52],[-53.09,48.69],[-52.65,47.54],[-53.07,46.66],[-54.18,46.81],[-54.24,47.75],[-55.4,46.88],[-56.0,46.92],[-55.29,47.39],[-56.25,47.63],[-59.27,47.6],[-58.8,48.25],[-59.23,48.52],[-57.36,50.72],[-55.41,51.59],[-56.13,50.69]],[[-132.71,54.04],[-131.75,54.12],[-132.05,52.98],[-131.18,52.18],[-133.05,53.41],[-133.18,54.17],[-132.71,54.04]],[[143.65,50.75],[144.65,48.98],[143.17,49.31],[142.56,47.86],[143.53,46.84],[143.51,46.14],[142.75,46.74],[142.09,45.97],[142.18,50.95],[141.59,51.94],[141.68,53.3],[142.61,53.76],[142.21,54.23],[142.65,54.37],[143.65,50.75]],[[-6.79,52.26],[-9.98,51.82],[-9.17,52.86],[-9.69,53.88],[-6.73,55.17],[-5.66,54.55],[-6.79,52.26]],[[-3.01,58.63],[-4.07,57.55],[-1.96,57.68],[-3.12,55.97],[-2.09,55.91],[0.47,52.93],[1.68,52.74],[1.05,51.81],[1.45,51.29],[-5.25,49.96],[-5.78,50.16],[-3.41,51.43],[-5.27,51.99],[-4.22,52.3],[-4.77,52.84],[-4.58,53.5],[-3.09,53.4],[-2.95,53.98],[-4.84,54.79],[-5.05,55.78],[-5.59,55.31],[-6.15,56.79],[-5.01,58.63],[-3.01,58.63]],[[-85.16,65.66],[-80.1,63.73],[-80.99,63.41],[-83.11,64.1],[-85.52,63.05],[-85.87,63.64],[-87.22,63.54],[-86.35,64.04],[-85.88,65.74],[-85.16,65.66]],[[-14.51,66.46],[-14.74,65.81],[-13.61,65.13],[-18.66,63.5],[-22.76,63.96],[-21.78,64.4],[-23.96,64.89],[-22.23,65.38],[-24.33,65.61],[-23.65,66.26],[-22.13,66.41],[-20.58,65.73],[-19.06,66.28],[-14.51,66.46]],[[-175.01,66.58],[-174.34,66.34],[-174.57,67.06],[-171.86,66.91],[-169.9,65.98],[-172.53,65.44],[-172.96,64.25],[-176.21,65.36],[-178.36,65.39],[-178.9,65.74],[-178.69,66.11],[-179.88,65.87],[-179.43,65.4],[-180,64.98],[-180,68.96],[-174.93,67.21],[-175.01,66.58]],[[-95.65,69.11],[-96.27,68.76],[-99.8,69.4],[-98.22,70.14],[-95.65,69.11]],[[-90.55,69.5],[-90.55,68.48],[-89.22,69.26],[-88.02,68.62],[-88.32,67.87],[-87.35,67.2],[-85.58,68.78],[-85.52,69.88],[-82.62,69.66],[-81.28,69.16],[-81.96,68.13],[-81.26,67.6],[-81.39,67.11],[-83.34,66.41],[-85.77,66.56],[-87.32,64.78],[-89.91,64.03],[-90.7,63.61],[-90.77,62.96],[-93.16,62.02],[-94.24,60.9],[-94.68,58.95],[-93.22,58.78],[-92.3,57.09],[-90.9,57.28],[-85.01,55.3],[-82.27,55.15],[-82.12,53.28],[-79.91,51.21],[-78.6,52.56],[-79.83,54.67],[-78.23,55.14],[-76.54,56.53],[-77.3,58.05],[-78.52,58.8],[-77.34,59.85],[-78.11,62.32],[-73.84,62.44],[-71.37,61.14],[-69.59,61.06],[-69.29,58.96],[-67.65,58.21],[-66.2,58.77],[-64.58,60.34],[-61.4,56.97],[-61.8,56.34],[-57.33,54.63],[-56.94,53.78],[-55.76,53.27],[-55.68,52.15],[-60.03,50.24],[-66.4,50.23],[-71.1,46.82],[-68.65,48.3],[-65.06,49.23],[-64.17,48.74],[-65.12,48.07],[-64.47,46.24],[-61.52,45.88],[-60.52,47.01],[-59.8,45.92],[-65.36,43.55],[-66.12,43.62],[-66.16,44.47],[-64.43,45.29],[-67.14,45.14],[-66.96,44.81],[-70.69,43.03],[-70.83,42.34],[-69.97,41.64],[-73.71,40.93],[-71.95,40.93],[-73.95,40.75],[-74.91,38.94],[-75.53,39.5],[-75.06,38.4],[-75.94,37.22],[-75.72,37.94],[-76.35,39.15],[-76.33,38.08],[-76.96,38.23],[-76.3,37.92],[-75.73,35.55],[-81.34,31.44],[-81.31,30.04],[-80.06,26.88],[-80.38,25.21],[-81.17,25.2],[-81.71,25.87],[-82.86,27.89],[-82.93,29.1],[-84.1,30.09],[-85.11,29.64],[-86.4,30.4],[-89.18,30.32],[-89.6,30.18],[-89.22,29.29],[-90.15,29.12],[-93.85,29.71],[-96.59,28.31],[-97.37,27.38],[-97.14,25.87],[-97.87,22.44],[-96.29,19.32],[-94.43,18.14],[-92.04,18.7],[-90.77,19.28],[-90.28,21.0],[-87.05,21.54],[-86.85,20.85],[-87.84,18.26],[-88.3,18.5],[-88.36,16.53],[-88.93,15.89],[-84.98,16.0],[-83.41,15.27],[-83.81,11.1],[-82.21,9.0],[-81.44,8.79],[-79.57,9.61],[-76.84,8.64],[-75.67,9.44],[-74.91,11.08],[-73.41,11.23],[-71.75,12.44],[-71.14,12.11],[-71.95,11.42],[-71.7,9.07],[-71.04,9.86],[-71.4,10.97],[-70.16,11.38],[-69.94,12.16],[-68.19,10.55],[-66.23,10.65],[-64.89,10.08],[-64.32,10.64],[-61.88,10.72],[-62.73,10.42],[-62.39,9.95],[-60.83,9.38],[-60.67,8.58],[-59.1,8.0],[-57.15,5.97],[-53.96,5.76],[-51.32,4.2],[-50.51,1.9],[-49.97,1.74],[-50.7,0.22],[-50.39,-0.08],[-48.62,-0.24],[-48.58,-1.24],[-47.82,-0.58],[-44.91,-1.55],[-44.58,-2.69],[-43.42,-2.38],[-39.98,-2.87],[-37.22,-4.82],[-35.6,-5.15],[-34.73,-7.34],[-35.13,-9.0],[-38.67,-13.06],[-39.27,-17.87],[-40.94,-21.94],[-41.99,-22.97],[-44.65,-23.35],[-47.65,-24.89],[-48.5,-25.88],[-48.89,-28.67],[-53.81,-34.4],[-56.22,-34.86],[-58.43,-33.91],[-58.5,-34.43],[-57.23,-35.29],[-56.79,-36.9],[-57.75,-38.18],[-59.23,-38.72],[-62.34,-38.83],[-62.15,-40.68],[-62.75,-41.03],[-65.12,-41.06],[-64.98,-42.06],[-63.76,-42.04],[-63.46,-42.56],[-65.18,-43.5],[-65.57,-45.04],[-67.29,-45.55],[-67.58,-46.3],[-65.64,-47.24],[-65.99,-48.13],[-69.14,-50.73],[-68.15,-52.35],[-70.85,-52.9],[-71.01,-53.83],[-74.95,-52.26],[-75.61,-48.67],[-74.13,-46.94],[-75.64,-46.65],[-74.69,-45.76],[-74.35,-44.1],[-73.24,-44.45],[-72.72,-42.38],[-73.39,-42.12],[-73.7,-43.37],[-74.33,-43.22],[-73.22,-39.26],[-73.59,-37.16],[-73.17,-37.12],[-71.44,-32.42],[-71.49,-28.86],[-70.91,-27.64],[-70.16,-19.76],[-70.37,-18.35],[-71.46,-17.36],[-76.01,-14.65],[-79.76,-7.19],[-81.25,-6.14],[-80.93,-5.69],[-81.41,-4.74],[-79.77,-2.66],[-80.97,-2.25],[-80.93,-1.06],[-80.09,0.77],[-78.86,1.38],[-78.43,2.63],[-77.13,3.85],[-78.18,8.32],[-79.56,8.93],[-80.48,8.09],[-80.0,7.55],[-80.89,7.22],[-81.06,7.82],[-83.51,8.45],[-84.98,10.09],[-85.11,9.56],[-85.66,9.93],[-85.71,11.09],[-87.67,12.91],[-87.49,13.3],[-91.23,13.93],[-94.69,16.2],[-96.56,15.65],[-103.5,18.29],[-105.49,19.95],[-105.27,21.42],[-106.03,22.77],[-112.23,28.95],[-113.15,31.17],[-114.78,31.8],[-114.67,30.16],[-109.43,23.19],[-110.03,22.82],[-112.18,24.74],[-112.3,26.01],[-115.06,27.72],[-114.16,28.57],[-115.52,29.56],[-117.3,33.05],[-118.52,34.03],[-120.62,34.61],[-124.4,40.31],[-124.53,42.77],[-123.9,45.52],[-124.69,48.18],[-123.12,48.04],[-122.59,47.1],[-122.84,49.0],[-127.44,50.83],[-127.85,52.33],[-129.13,52.76],[-129.31,53.56],[-131.97,55.5],[-134.08,58.12],[-136.63,58.21],[-139.87,59.54],[-147.11,60.88],[-148.22,60.67],[-148.02,59.98],[-151.72,59.16],[-151.41,60.73],[-150.35,61.03],[-150.62,61.28],[-154.02,59.35],[-153.29,58.86],[-154.23,58.15],[-158.43,55.99],[-164.79,54.4],[-157.72,57.57],[-157.04,58.92],[-159.06,58.42],[-160.36,59.07],[-161.97,58.67],[-161.87,59.63],[-163.82,59.8],[-166.12,61.5],[-164.56,63.15],[-160.77,63.77],[-161.52,64.4],[-160.78,64.79],[-164.96,64.45],[-168.11,65.67],[-164.47,66.58],[-163.65,66.58],[-163.79,66.08],[-161.68,66.12],[-166.76,68.36],[-166.2,68.88],[-163.17,69.37],[-161.91,70.33],[-156.58,71.36],[-154.34,70.7],[-143.59,70.15],[-136.5,68.9],[-129.79,70.19],[-129.11,69.78],[-128.14,70.48],[-125.76,69.48],[-124.42,70.16],[-124.29,69.4],[-121.47,69.8],[-113.9,68.4],[-115.3,67.9],[-109.95,67.98],[-108.88,67.38],[-107.79,67.89],[-108.81,68.31],[-108.17,68.65],[-106.15,68.8],[-101.45,67.65],[-98.44,67.78],[-98.56,68.4],[-97.67,68.58],[-96.12,68.24],[-96.13,67.29],[-95.49,68.09],[-94.68,68.06],[-94.23,69.07],[-96.47,70.09],[-96.39,71.19],[-95.21,71.92],[-92.88,71.32],[-91.52,70.19],[-92.41,69.7],[-90.55,69.5]],[[-114.17,73.12],[-114.67,72.65],[-112.44,72.96],[-111.05,72.45],[-109.92,72.96],[-108.19,71.65],[-107.69,72.07],[-108.4,73.09],[-106.52,73.08],[-105.4,72.67],[-104.46,70.99],[-100.98,70.02],[-101.09,69.58],[-102.73,69.5],[-102.09,69.12],[-102.43,68.75],[-105.96,69.18],[-113.31,68.54],[-117.34,69.96],[-112.42,70.37],[-117.9,70.54],[-118.43,70.91],[-116.11,71.31],[-119.4,71.56],[-117.87,72.71],[-114.17,73.12]],[[-76.34,73.1],[-79.49,72.74],[-80.88,73.33],[-80.35,73.76],[-78.06,73.65],[-76.34,73.1]],[[-86.56,73.16],[-85.77,72.53],[-84.85,73.34],[-82.32,73.75],[-80.6,72.72],[-80.75,72.06],[-77.82,72.75],[-74.23,71.77],[-74.1,71.33],[-72.24,71.56],[-68.79,70.53],[-66.97,69.19],[-68.81,68.72],[-61.85,66.86],[-63.92,65.0],[-66.72,66.39],[-68.02,66.26],[-68.14,65.69],[-65.32,64.38],[-64.67,63.39],[-65.01,62.67],[-68.78,63.75],[-66.17,61.93],[-71.02,62.91],[-74.83,64.68],[-77.71,64.23],[-78.56,64.57],[-77.9,65.31],[-73.96,65.45],[-74.29,65.81],[-72.65,67.28],[-72.93,67.73],[-76.87,68.89],[-76.23,69.15],[-78.96,70.17],[-84.94,69.97],[-88.68,70.41],[-89.51,70.76],[-88.47,71.22],[-89.89,71.22],[-90.21,72.24],[-89.44,73.13],[-85.83,73.8],[-86.56,73.16]],[[-100.36,73.84],[-97.38,73.76],[-97.12,73.47],[-98.05,72.99],[-96.54,72.56],[-96.72,71.66],[-99.32,71.36],[-102.5,72.51],[-100.44,72.71],[-101.54,73.36],[-100.36,73.84]],[[-93.2,72.77],[-94.27,72.02],[-95.41,72.06],[-96.02,73.44],[-94.5,74.13],[-90.51,73.86],[-93.2,72.77]],[[-120.46,71.4],[-123.09,70.9],[-125.93,71.87],[-123.94,73.68],[-124.92,74.29],[-117.56,74.19],[-115.51,73.48],[-119.22,72.52],[-120.46,71.4]],[[145.09,75.56],[144.3,74.82],[138.96,74.61],[136.97,75.26],[137.51,75.95],[138.83,76.14],[145.09,75.56]],[[-98.5,76.72],[-97.74,76.26],[-98.16,75],[-102.5,75.56],[-102.57,76.34],[-98.5,76.72]],[[-108.21,76.2],[-105.88,75.97],[-105.7,75.48],[-106.31,75.01],[-112.22,74.42],[-113.87,74.72],[-111.79,75.16],[-117.71,75.22],[-115.4,76.48],[-109.07,75.47],[-110.5,76.43],[-109.58,76.79],[-108.21,76.2]],[[57.54,70.72],[53.68,70.76],[51.6,71.47],[51.46,72.01],[54.43,73.63],[53.51,73.75],[55.9,74.63],[55.63,75.08],[61.17,76.25],[68.16,76.94],[68.85,76.54],[58.48,74.31],[55.42,72.37],[55.62,71.54],[57.54,70.72]],[[-94.68,77.1],[-91.61,76.78],[-90.74,76.45],[-90.97,76.07],[-89.19,75.61],[-81.13,75.71],[-79.83,74.92],[-81.95,74.44],[-89.76,74.52],[-92.42,74.84],[-92.89,75.88],[-93.89,76.32],[-97.12,76.75],[-96.75,77.16],[-94.68,77.1]],[[-116.2,77.65],[-116.34,76.88],[-117.11,76.53],[-122.85,76.12],[-119.1,77.51],[-116.2,77.65]],[[106.97,76.97],[107.24,76.48],[111.08,76.71],[114.13,75.85],[113.89,75.33],[109.4,74.18],[113.02,73.98],[113.53,73.34],[115.57,73.75],[123.2,72.97],[123.26,73.74],[126.98,73.57],[128.59,73.04],[129.05,72.4],[128.46,71.98],[131.29,70.79],[132.25,71.84],[133.86,71.39],[139.87,71.49],[139.15,72.42],[140.47,72.85],[149.5,72.2],[152.97,70.84],[159.0,70.87],[159.83,70.45],[159.71,69.72],[160.94,69.44],[167.84,69.58],[169.58,68.69],[170.82,69.01],[170.01,69.65],[170.45,70.1],[175.72,69.88],[180,68.96],[180,64.98],[177.41,64.61],[179.37,62.98],[179.23,62.3],[177.36,62.52],[173.68,61.65],[170.33,59.88],[168.9,60.57],[166.3,59.79],[165.84,60.16],[163.54,59.87],[162.02,58.24],[163.19,57.62],[163.06,56.16],[162.13,56.12],[161.7,55.29],[162.12,54.86],[160.37,54.34],[160.02,53.2],[158.53,52.96],[158.23,51.94],[156.79,51.01],[155.43,55.38],[155.91,56.77],[156.81,57.83],[158.36,58.06],[163.67,61.14],[164.47,62.55],[163.26,62.47],[162.66,61.64],[160.12,60.54],[159.3,61.77],[156.72,61.43],[154.22,59.76],[155.04,59.15],[151.27,58.78],[151.34,59.5],[149.78,59.66],[148.54,59.16],[142.2,59.04],[135.13,54.73],[136.7,54.6],[138.16,53.76],[139.9,54.19],[141.35,53.09],[141.38,52.24],[140.6,51.24],[140.06,48.45],[138.22,46.31],[134.87,43.4],[133.54,42.81],[132.28,43.28],[129.97,41.94],[129.71,40.88],[127.53,39.76],[127.39,39.21],[129.46,36.78],[129.09,35.08],[126.49,34.39],[126.12,36.73],[126.86,36.89],[126.17,37.75],[124.71,38.11],[125.32,39.55],[124.27,39.93],[121.05,38.9],[122.17,40.42],[121.64,40.95],[119.02,39.25],[118.04,39.2],[117.53,38.74],[118.91,37.45],[119.7,37.16],[120.82,37.87],[122.36,37.45],[122.52,36.93],[121.1,36.65],[119.15,34.91],[120.23,34.36],[121.91,31.69],[121.89,30.95],[121.26,30.68],[122.09,29.83],[121.68,28.23],[121.13,28.14],[118.66,24.55],[115.89,22.78],[110.79,21.4],[110.44,20.34],[109.89,20.28],[109.86,21.4],[108.52,21.72],[105.88,19.75],[105.66,19.06],[108.88,15.28],[109.34,13.43],[109.2,11.67],[105.16,8.6],[105.08,9.92],[103.5,10.63],[102.59,12.19],[100.83,12.63],[100.98,13.41],[100.1,13.41],[99.22,9.24],[99.87,9.21],[100.46,7.43],[102.96,5.52],[104.23,1.29],[103.52,1.23],[101.39,2.76],[100.09,6.46],[98.5,8.38],[98.34,7.79],[98.76,11.44],[97.16,16.93],[95.37,15.71],[94.19,16.04],[94.32,18.21],[91.42,22.77],[90.5,22.81],[90.27,21.84],[86.98,21.5],[86.5,20.15],[85.06,19.48],[82.19,16.56],[80.32,15.9],[79.86,10.36],[77.54,7.97],[76.59,8.9],[73.53,15.99],[72.63,21.36],[70.47,20.88],[69.16,22.09],[69.64,22.45],[69.35,22.84],[67.44,23.94],[66.37,25.43],[61.5,25.08],[57.4,25.74],[56.49,27.14],[54.72,26.48],[51.52,27.87],[50.12,30.15],[47.97,29.98],[48.81,27.69],[50.15,26.69],[50.81,24.75],[51.01,26.01],[51.59,25.8],[51.79,24.02],[54.01,24.12],[56.36,26.4],[56.85,24.24],[58.73,23.57],[59.81,22.31],[57.83,20.24],[57.69,18.94],[55.27,17.23],[52.39,16.38],[52.17,15.6],[48.68,14.0],[43.48,12.64],[42.6,15.21],[42.65,16.77],[39.14,21.29],[38.49,23.69],[37.48,24.29],[35.13,28.06],[34.63,28.06],[34.92,29.5],[33.92,27.65],[32.42,29.85],[35.69,23.93],[35.53,23.1],[36.87,22.0],[37.48,18.61],[38.41,18.0],[39.27,15.92],[43.32,12.39],[42.72,11.74],[44.61,10.44],[51.11,12.02],[51.05,10.64],[47.74,4.22],[40.26,-2.57],[39.2,-4.68],[38.8,-6.48],[39.44,-6.84],[39.19,-8.49],[40.48,-10.77],[40.78,-14.69],[39.45,-16.72],[37.41,-17.59],[34.79,-19.78],[35.61,-23.71],[32.57,-25.73],[32.92,-26.22],[32.2,-28.75],[28.22,-32.77],[25.78,-33.94],[22.57,-33.86],[19.62,-34.82],[18.38,-34.14],[17.93,-32.61],[18.22,-31.66],[15.21,-27.09],[14.26,-22.11],[11.79,-18.07],[11.78,-15.79],[13.63,-12.04],[13.69,-10.73],[11.92,-5.04],[8.8,-1.11],[9.8,3.07],[9.4,3.73],[8.5,4.77],[5.9,4.26],[4.33,6.27],[1.87,6.14],[-1.96,4.71],[-4.65,5.17],[-7.52,4.34],[-9.0,4.83],[-12.43,7.26],[-14.84,10.88],[-16.61,12.17],[-16.71,13.6],[-17.62,14.73],[-16.46,16.14],[-16.15,18.11],[-16.97,21.89],[-14.44,26.25],[-9.56,29.93],[-9.81,31.18],[-9.3,32.56],[-6.91,34.11],[-5.93,35.76],[-2.17,35.17],[1.47,36.61],[9.51,37.35],[10.21,37.23],[10.18,36.72],[11.1,36.9],[10.6,36.41],[10.94,35.7],[10.34,33.79],[15.25,32.27],[15.71,31.38],[19.09,30.27],[20.05,30.99],[20.13,32.24],[21.54,32.84],[28.91,30.87],[30.98,31.56],[31.96,30.93],[33.77,30.97],[34.56,31.55],[36.0,34.64],[36.16,36.65],[34.71,36.8],[32.51,36.11],[31.7,36.64],[29.7,36.14],[27.64,36.66],[26.32,38.21],[26.8,38.99],[26.17,39.46],[27.28,40.42],[28.82,40.46],[29.24,41.22],[31.15,41.09],[33.51,42.02],[35.17,42.04],[38.35,40.95],[40.37,41.01],[41.7,41.96],[41.45,42.65],[36.68,45.24],[38.23,46.24],[37.67,46.64],[39.12,47.26],[34.96,46.27],[35.02,45.65],[36.53,45.47],[36.33,45.11],[33.88,44.36],[33.33,44.56],[33.55,45.03],[32.45,45.33],[33.59,45.85],[33.3,46.08],[30.75,46.58],[29.63,45.04],[28.84,44.91],[27.67,42.58],[28.81,41.05],[27.62,41.0],[26.36,40.15],[26.06,40.82],[24.93,40.95],[23.71,40.69],[24.41,40.13],[23.9,39.96],[22.63,40.26],[24.04,37.66],[23.12,37.92],[23.41,37.41],[22.78,37.31],[23.15,36.42],[22.49,36.41],[21.67,36.85],[21.12,38.31],[19.41,40.25],[19.54,41.72],[16.02,43.51],[14.9,45.08],[13.95,44.8],[13.94,45.59],[13.14,45.74],[12.33,45.38],[12.59,44.09],[15.14,41.96],[15.93,41.96],[15.89,41.54],[18.48,40.17],[18.29,39.81],[16.87,40.44],[16.45,39.8],[17.17,39.42],[17.05,38.9],[16.1,37.99],[15.68,37.91],[16.11,38.96],[15.41,40.05],[12.11,41.7],[10.51,42.93],[10.2,43.92],[8.89,44.37],[6.53,43.13],[3.1,43.08],[3.04,41.89],[0.81,41.01],[-0.28,39.31],[0.11,38.74],[-2.15,36.67],[-4.37,36.68],[-5.38,35.95],[-6.52,36.94],[-8.9,36.87],[-8.84,38.27],[-9.53,38.74],[-8.77,40.76],[-9.39,43.03],[-7.98,43.75],[-1.9,43.42],[-1.38,44.02],[-1.19,46.01],[-2.96,47.57],[-4.49,47.96],[-4.59,48.68],[-1.62,48.64],[-1.93,49.78],[-0.99,49.35],[1.34,50.13],[1.64,50.95],[3.83,51.62],[4.71,53.09],[8.12,53.53],[8.8,54.02],[8.12,55.52],[8.54,57.11],[10.58,57.73],[10.25,56.89],[10.91,56.46],[9.65,55.47],[9.94,54.6],[10.94,54.01],[12.52,54.47],[14.12,53.76],[17.62,54.85],[19.66,54.43],[21.27,55.19],[21.09,56.78],[21.58,57.41],[22.52,57.75],[23.32,57.01],[24.12,57.03],[24.43,58.38],[23.43,58.61],[23.34,59.19],[27.98,59.48],[29.12,60.03],[28.07,60.5],[22.87,59.85],[21.32,60.72],[21.54,61.71],[21.06,62.61],[21.54,63.19],[25.4,65.11],[23.9,66.01],[22.18,65.72],[21.21,65.03],[21.37,64.41],[17.85,62.75],[17.12,61.34],[18.79,60.08],[17.87,58.95],[16.83,58.72],[15.88,56.1],[14.67,56.2],[14.1,55.41],[12.94,55.36],[10.36,59.47],[8.38,58.31],[7.05,58.08],[5.67,58.59],[4.99,61.97],[10.53,64.49],[14.76,67.81],[19.18,69.82],[23.02,70.2],[24.55,71.03],[28.17,71.19],[31.29,70.45],[30.01,70.19],[31.1,69.56],[32.13,69.91],[36.51,69.06],[41.06,67.46],[41.13,66.79],[38.38,66.0],[33.18,66.63],[34.81,65.9],[34.94,64.41],[37.01,63.85],[36.52,64.78],[37.18,65.14],[39.59,64.52],[40.44,64.76],[39.76,65.5],[42.09,66.48],[43.95,66.07],[44.53,66.76],[43.7,67.35],[44.19,67.95],[43.45,68.57],[46.25,68.25],[46.82,67.69],[45.56,67.57],[45.56,67.01],[46.35,66.67],[53.72,68.86],[54.47,68.81],[53.49,68.2],[58.8,68.88],[59.94,68.28],[61.08,68.94],[60.03,69.52],[60.55,69.85],[68.51,68.09],[69.18,68.62],[66.93,69.45],[67.26,69.93],[66.69,71.03],[68.54,71.93],[69.2,72.84],[72.59,72.78],[72.8,72.22],[71.85,71.41],[72.79,70.39],[72.56,69.02],[73.67,68.41],[71.28,66.32],[72.42,66.17],[75.05,67.76],[74.47,68.33],[74.94,68.99],[73.84,69.07],[73.6,69.63],[74.4,70.63],[73.1,71.45],[74.89,72.12],[74.66,72.83],[75.68,72.3],[75.29,71.34],[76.36,71.15],[75.9,71.87],[77.58,72.27],[81.5,71.75],[80.61,72.58],[80.51,73.65],[86.82,73.94],[86.01,74.46],[87.17,75.12],[100.76,76.43],[101.99,77.29],[104.35,77.7],[106.07,77.37],[104.71,77.13],[106.97,76.97]],[[24.72,77.85],[20.73,77.68],[21.42,77.94],[20.81,78.25],[22.88,78.45],[24.72,77.85]],[[-100.06,78.32],[-99.67,77.91],[-105.18,78.38],[-104.21,78.68],[-105.49,79.3],[-100.06,78.32]],[[105.08,78.31],[99.44,77.92],[102.09,79.35],[105.37,78.71],[105.08,78.31]],[[18.25,79.7],[21.54,78.96],[19.03,78.56],[17.12,76.81],[15.91,76.77],[13.76,77.38],[14.67,77.74],[11.22,78.87],[10.44,79.65],[16.99,80.05],[18.25,79.7]],[[25.45,80.41],[27.41,80.06],[23.02,79.4],[17.37,80.32],[25.45,80.41]],[[51.14,80.55],[47.59,80.01],[46.5,80.25],[47.07,80.56],[44.85,80.59],[51.52,80.7],[51.14,80.55]],[[99.94,78.88],[94.97,79.04],[91.18,80.34],[95.94,81.25],[100.19,79.78],[99.94,78.88]],[[-87.02,79.66],[-85.81,79.34],[-90.8,78.22],[-92.88,78.34],[-93.95,78.75],[-93.15,79.38],[-94.97,79.37],[-96.71,80.16],[-94.3,80.98],[-94.74,81.21],[-92.41,81.26],[-87.81,80.32],[-87.02,79.66]],[[-68.5,83.11],[-61.85,82.63],[-67.66,81.5],[-65.48,81.51],[-71.18,79.8],[-76.91,79.32],[-75.53,79.2],[-76.22,79.02],[-75.39,78.53],[-79.76,77.21],[-77.89,76.78],[-80.56,76.18],[-89.49,76.47],[-89.62,76.95],[-87.77,77.18],[-88.26,77.9],[-84.98,77.54],[-87.96,78.37],[-85.09,79.35],[-86.93,80.25],[-81.85,80.46],[-87.6,80.52],[-91.59,81.89],[-85.5,82.65],[-83.18,82.32],[-82.42,82.86],[-79.31,83.13],[-68.5,83.11]],[[-27.1,83.52],[-20.85,82.73],[-31.9,82.2],[-22.07,81.73],[-23.17,81.15],[-15.77,81.91],[-12.21,81.29],[-20.05,80.18],[-17.73,80.13],[-19.7,78.75],[-19.67,77.64],[-18.47,76.99],[-21.68,76.63],[-19.83,76.1],[-19.6,75.25],[-20.67,75.16],[-19.37,74.3],[-21.59,74.22],[-20.43,73.82],[-20.76,73.46],[-23.57,73.31],[-22.3,72.18],[-24.79,72.33],[-22.13,71.47],[-21.75,70.66],[-23.54,70.47],[-25.54,71.43],[-25.2,70.75],[-26.36,70.23],[-22.35,70.13],[-27.75,68.47],[-31.78,68.12],[-34.2,66.68],[-39.81,65.46],[-41.19,63.48],[-42.82,62.68],[-42.42,61.9],[-43.38,60.1],[-48.26,60.86],[-51.63,63.63],[-52.28,65.18],[-53.66,66.1],[-53.3,66.84],[-53.97,67.19],[-52.98,68.36],[-51.48,68.73],[-50.87,69.93],[-53.46,69.28],[-54.68,69.61],[-54.36,70.82],[-51.39,70.57],[-55.83,71.65],[-54.72,72.59],[-58.59,75.52],[-61.27,76.1],[-68.5,76.06],[-71.4,77.01],[-66.76,77.38],[-73.3,78.04],[-73.16,78.43],[-65.71,79.39],[-65.32,79.76],[-68.02,80.12],[-62.23,81.32],[-62.65,81.77],[-57.21,82.19],[-53.04,81.89],[-50.39,82.44],[-44.52,81.66],[-46.9,82.2],[-46.76,82.63],[-38.62,83.55],[-27.1,83.52]]];

// Night-lights field derived from the hotspots, clipped to land so glows don't spill
// into the ocean. Each city center seeds a cluster of smaller lights; busy regions
// (e.g. California) bloom into a connected glow. Format: [lat, lon, weight, spread].
const GLOBE_LIGHTS = (()=>{
  // Test a point against proper closed land polygons so glows stay on land.
  const pointOnLand=(lon,lat)=>{
    for(const poly of GEO_LANDMASS){
      let inside=false;
      for(let i=0,j=poly.length-1;i<poly.length;j=i++){
        const xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1];
        if(((yi>lat)!==(yj>lat))&&(lon<(xj-xi)*(lat-yi)/(yj-yi)+xi))inside=!inside;
      }
      if(inside)return true;
    }
    return false;
  };
  const out=[];
  let s=20260101; const rnd=()=>{ s=(s*1664525+1013904223)&0xffffffff; return (s>>>0)/0xffffffff; };
  for(const [lat,lon,w] of GLOBE_HOTSPOTS){
    out.push([lat,lon,w,1.05]);                 // bright core (always kept)
    const n=Math.round(6+w*26);                 // more satellites for busier areas
    const ring=0.5+w*3.4;                        // sprawl radius
    let placed=0,tries=0;
    while(placed<n&&tries<n*6){
      tries++;
      const ang=rnd()*Math.PI*2;
      const r=Math.pow(rnd(),0.6)*ring;          // bias toward the center
      const nlat=lat+Math.sin(ang)*r;
      const nlon=lon+Math.cos(ang)*r/Math.max(0.35,Math.cos(lat*Math.PI/180));
      if(!pointOnLand(nlon,nlat))continue;        // keep lights on land only
      const fall=1-r/(ring+0.001);
      out.push([nlat,nlon,Math.max(0.05,w*(0.20+0.55*fall*rnd())),0.6+rnd()*0.45]);
      placed++;
    }
  }
  return out;
})();

function GlobeHeatmap({size=180,showStates=true}){
  const canvasRef=useRef(null);
  const rafRef=useRef(0);
  const rotRef=useRef(0);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas)return;
    const ctx=canvas.getContext("2d");
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=size*dpr; canvas.height=size*dpr;
    ctx.scale(dpr,dpr);
    const cx=size/2, cy=size/2, R=size*0.42;
    const tilt=23.5*Math.PI/180; // axial tilt
    const sinT=Math.sin(tilt), cosT=Math.cos(tilt);

    // Project a lat/lon to 3D, rotate around the (tilted) Y axis, return screen coords + depth.
    const project=(lat,lon,rot)=>{
      const la=lat*Math.PI/180, lo=(lon*Math.PI/180)+rot;
      let x=Math.cos(la)*Math.sin(lo);
      let y=Math.sin(la);
      let z=Math.cos(la)*Math.cos(lo);
      // apply axial tilt around X axis
      const y2=y*cosT - z*sinT;
      const z2=y*sinT + z*cosT;
      return {x:cx+x*R, y:cy-y2*R, z:z2};
    };

    const draw=()=>{
      ctx.clearRect(0,0,size,size);
      const rot=rotRef.current;

      // Sphere base glow
      const grd=ctx.createRadialGradient(cx,cy,R*0.2,cx,cy,R*1.05);
      grd.addColorStop(0,"rgba(40,26,14,0.55)");
      grd.addColorStop(0.7,"rgba(20,12,8,0.35)");
      grd.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=grd;
      ctx.beginPath(); ctx.arc(cx,cy,R*1.05,0,Math.PI*2); ctx.fill();

      // Rim ring
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
      ctx.strokeStyle="rgba(201,168,76,0.28)"; ctx.lineWidth=1; ctx.stroke();

      // Faint lat/lon graticule (sphere wireframe)
      ctx.strokeStyle="rgba(201,168,76,0.07)"; ctx.lineWidth=0.5;
      for(let lat=-60;lat<=60;lat+=30){
        ctx.beginPath(); let started=false;
        for(let lon=-180;lon<=180;lon+=4){
          const p=project(lat,lon,rot);
          if(p.z>0){ if(!started){ctx.moveTo(p.x,p.y);started=true;}else ctx.lineTo(p.x,p.y); }
          else started=false;
        }
        ctx.stroke();
      }
      for(let lon=-180;lon<180;lon+=30){
        ctx.beginPath(); let started=false;
        for(let lat=-90;lat<=90;lat+=4){
          const p=project(lat,lon,rot);
          if(p.z>0){ if(!started){ctx.moveTo(p.x,p.y);started=true;}else ctx.lineTo(p.x,p.y); }
          else started=false;
        }
        ctx.stroke();
      }

      // Draw a set of geo polylines ([lon,lat] points) as borders on the front hemisphere.
      const drawGeo=(lines,stroke,width)=>{
        ctx.strokeStyle=stroke; ctx.lineWidth=width;
        for(const line of lines){
          ctx.beginPath(); let started=false;
          for(let k=0;k<line.length;k++){
            const lon=line[k][0], lat=line[k][1];
            const p=project(lat,lon,rot);
            if(p.z>0.02){ if(!started){ctx.moveTo(p.x,p.y);started=true;}else ctx.lineTo(p.x,p.y); }
            else { started=false; }
          }
          ctx.stroke();
        }
      };
      // State/province lines (faintest), then country borders, then coastlines (brightest).
      if(showStates) drawGeo(GEO_STATES,"rgba(201,168,76,0.16)",0.5);
      drawGeo(GEO_COUNTRIES,"rgba(201,168,76,0.30)",0.6);
      drawGeo(GEO_COAST,"rgba(214,182,99,0.62)",0.8);

      // Night-lights: additive blending makes overlapping glows pool brighter in dense areas.
      ctx.save();
      ctx.globalCompositeOperation="lighter";
      for(const [lat,lon,w,spread] of GLOBE_LIGHTS){
        const p=project(lat,lon,rot);
        if(p.z>0.04){
          const depth=0.35+p.z*0.65;             // fade toward the limb
          const haze=(spread||1)*(2.5+w*7)*depth; // soft outer bloom
          const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,haze);
          g.addColorStop(0,`rgba(255,205,120,${0.42*w*depth})`);
          g.addColorStop(0.35,`rgba(244,140,70,${0.20*w*depth})`);
          g.addColorStop(1,"rgba(232,97,58,0)");
          ctx.fillStyle=g;
          ctx.beginPath(); ctx.arc(p.x,p.y,haze,0,Math.PI*2); ctx.fill();
          // bright pinpoint core for the strongest lights
          if(w>0.25){
            const cr=Math.max(0.5,(0.7+w*1.6)*depth);
            ctx.fillStyle=`rgba(255,235,190,${0.5*depth})`;
            ctx.beginPath(); ctx.arc(p.x,p.y,cr,0,Math.PI*2); ctx.fill();
          }
        }
      }
      ctx.restore();

      rotRef.current+=0.0022; // slow rotation
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[size,showStates]);

  return <div style={{display:"flex",justifyContent:"center",alignItems:"center",position:"relative"}}>
    <canvas ref={canvasRef} style={{width:size,height:size,display:"block"}}/>
  </div>;
}

function Auth({onLogin,onGuest}) {
  const mobile = useIsMobile();
  const [mode,setMode]=useState("login");
  const [agreed,setAgreed]=useState(false);
  const [staySignedIn,setStaySignedIn]=useState(true);
  const [name,setName]=useState(""),  [email,setEmail]=useState(""), [pass,setPass]=useState("");
  const [err,setErr]=useState(""), [loading,setLoading]=useState(false), [show,setShow]=useState(false);
  const [mobileFormOpen,setMobileFormOpen]=useState(false);
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
    {/* Left branding (info panel) — shown on both desktop and mobile */}
    <div className="ai-in" style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:mobile?"24px 20px 40px":"48px 6vw",position:mobile?"relative":"sticky",top:0,minHeight:mobile?"auto":"100vh",zIndex:1,overflowY:mobile?"visible":"auto",borderRight:mobile?"none":"none",maxWidth:mobile?"100%":"none"}}>
      {/* Mobile-only Sign In button at the top */}
            <div style={{width:"100%",maxWidth:mobile?"100%":560,margin:"0 auto"}}>
      {/* Logo */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:28}}>
        <div style={{fontSize:44,filter:"drop-shadow(0 0 20px rgba(201,168,76,.6))",display:"flex",alignItems:"center",justifyContent:"center"}}><I.SwordShield s={34} c="#c9a84c"/></div>
        <div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:9,color:"rgba(201,168,76,.55)",letterSpacing:5,lineHeight:1,marginBottom:4}}>— YOUR CAREER —</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:32,fontWeight:700,background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.1}}>Main Quest</div>
        </div>
        {/* Mobile-only inline Sign In button, to the right of the title */}
        {mobile&&<><div style={{flex:1}}/><button onClick={()=>setMobileFormOpen(true)} style={{background:"linear-gradient(135deg,#c9a84c,#e8613a)",border:"none",color:"#0a0608",cursor:"pointer",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:800,fontFamily:"'Cinzel',serif",letterSpacing:.5,flexShrink:0,whiteSpace:"nowrap"}}>Sign In</button></>}
      </div>
      {/* Hero tagline */}
      <h1 style={{fontFamily:"'Cinzel',serif",fontSize:28,fontWeight:700,color:"#f4edd8",lineHeight:1.3,marginBottom:10,letterSpacing:.5}}>Your launchpad into the game industry.</h1>
      <p style={{color:"rgba(244,237,216,.55)",fontSize:14,lineHeight:1.7,marginBottom:28}}>One giant game job hub. Main Quest brings live job listings from game studios across North America into one convenient place — with smart job match scoring, reusable email templates, and application tracking to help you land your next role faster.</p>
      {/* Divider */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24,opacity:.5}}>
        <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(201,168,76,.6))"}}/>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"#c9a84c",letterSpacing:2}}>✦ ✦ ✦</span>
        <div style={{flex:1,height:1,background:"linear-gradient(270deg,transparent,rgba(201,168,76,.6))"}}/>
      </div>
      {/* Features */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:24}}>
        {[
          [<I.Globe s={17} c="#f0d080"/>,"Job Board","760+ studios across the US and Canada, filtered by state, role, and experience."],
          [<I.Target s={17} c="#f0d080"/>,"Job Match Score","See how well each posting fits your skills and experience, 0–10."],
          [<I.Scroll s={17} c="#f0d080"/>,"Resume Upload","Upload your resume to auto-fill your profile in seconds."],
          [<I.Clipboard s={17} c="#f0d080"/>,"App Tracker","Track every application with dates and one-click access."],
          [<I.Send s={17} c="#f0d080"/>,"Email Templates","Save a reusable template that auto-fills for each job you apply to."],
          [<I.Bell s={17} c="#f0d080"/>,"Company Alerts","Turn on notifications for the studios you care about most."],
        ].map(([ic,title,desc])=>
          <div key={title} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.1)",borderRadius:10}}>
            <span style={{flexShrink:0,marginTop:1,display:"flex"}}>{ic}</span>
            <div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:11,fontWeight:700,color:"#f0d080",marginBottom:2,letterSpacing:.3}}>{title}</div>
              <div style={{fontSize:11,color:"rgba(244,237,216,.48)",lineHeight:1.45}}>{desc}</div>
            </div>
          </div>
        )}
      </div>
      {/* Stats */}
      <div style={{display:"flex",alignItems:"center",gap:0,background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.12)",borderRadius:12,overflow:"hidden"}}>
        {[["760+","Studios"],["Live","Job Feeds"],["2","Countries"],["Free","Always"]].map(([n,l],i)=>(
          <div key={l} style={{flex:1,padding:"12px 0",textAlign:"center",borderRight:i<3?"1px solid rgba(201,168,76,.12)":"none"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{n}</div>
            <div style={{fontSize:9,color:"rgba(244,237,216,.35)",textTransform:"uppercase",letterSpacing:1,fontFamily:"'Cinzel',serif"}}>{l}</div>
          </div>
        ))}
      </div>
      {mobile&&<button onClick={()=>onGuest&&onGuest()} style={{width:"100%",marginTop:22,background:"linear-gradient(135deg,#c9a84c,#e8613a)",border:"none",color:"#0a0608",cursor:"pointer",borderRadius:10,padding:"13px",fontSize:13,fontWeight:800,fontFamily:"'Cinzel',serif",letterSpacing:.5,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>View Jobs →</button>}
      </div>
    </div>
    {/* Center divider bar (desktop only) — a short vertical line, not full height */}
    {!mobile&&<div style={{width:1,alignSelf:"center",height:"55vh",background:"linear-gradient(180deg,transparent,rgba(201,168,76,.35),transparent)",zIndex:1,flexShrink:0}}/>}
    {/* Right form — desktop: right half centered; mobile: overlay popup when opened */}
    <div style={{flex:mobile?"none":1,display:mobile?(mobileFormOpen?"flex":"none"):"flex",alignItems:"center",justifyContent:"center",padding:mobile?"20px 16px":"40px 6vw",position:mobile?"fixed":"relative",inset:mobile?0:"auto",background:mobile?"rgba(4,3,2,.85)":"transparent",backdropFilter:mobile?"blur(4px)":"none",zIndex:mobile?1000:1,overflowY:"auto",minHeight:mobile?"100vh":"100vh"}} onClick={mobile?(e=>{if(e.target===e.currentTarget)setMobileFormOpen(false);}):undefined}>
      <div style={{width:"100%",maxWidth:420,background:"rgba(20,14,28,.88)",backdropFilter:"blur(30px)",border:"1px solid rgba(201,168,76,.22)",borderRadius:22,overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,.5)",position:"relative"}}>
        {/* Mobile close button */}
        {mobile&&<button onClick={()=>setMobileFormOpen(false)} style={{position:"absolute",top:12,right:14,background:"none",border:"none",color:"rgba(244,237,216,.5)",cursor:"pointer",fontSize:20,lineHeight:1,zIndex:5}}>✕</button>}
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
            <div style={{position:"relative"}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",opacity:.5,pointerEvents:"none",display:"flex"}}><I.Person s={14} c="#c9a84c"/></span><input className="mq-in" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} autoFocus/></div>
          </div>}
          <div>
            <div style={{fontSize:10,color:"rgba(201,168,76,.8)",textTransform:"uppercase",letterSpacing:1.5,fontFamily:"'Cinzel',serif",marginBottom:5}}>Email Address</div>
            <div style={{position:"relative"}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",opacity:.5,pointerEvents:"none",display:"flex"}}><I.Scroll s={14} c="#c9a84c"/></span><input className="mq-in" type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} autoFocus={mode==="login"}/></div>
          </div>
          <div>
            <div style={{fontSize:10,color:"rgba(201,168,76,.8)",textTransform:"uppercase",letterSpacing:1.5,fontFamily:"'Cinzel',serif",marginBottom:5}}>Password</div>
            <div style={{position:"relative"}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",opacity:.5,pointerEvents:"none",display:"flex"}}><I.Lock s={14} c="#c9a84c"/></span><input className="mq-in" type={show?"text":"password"} placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} style={{paddingRight:40}}/><button onClick={()=>setShow(s=>!s)} tabIndex={-1} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",opacity:.5,display:"flex"}}>{show?<I.EyeOff s={15} c="#c9a84c"/>:<I.Eye s={15} c="#c9a84c"/>}</button></div>
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
          <button onClick={submit} disabled={loading} style={{background:G,border:"none",color:"#0a0608",cursor:loading?"not-allowed":"pointer",fontSize:12,fontWeight:800,padding:13,borderRadius:10,fontFamily:"'Cinzel',serif",letterSpacing:1.5,textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:loading?.7:1,transition:"all .2s"}} onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(201,168,76,.35)"}}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=""}}>{loading?"⟳":<>{mode==="login"?"Sign In":"Create Account"} →</>}</button>
          <div style={{display:"flex",alignItems:"center",gap:10,color:"rgba(244,237,216,.2)"}}>
            <div style={{flex:1,height:1,background:"rgba(201,168,76,.12)"}}/>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:"rgba(201,168,76,.35)",letterSpacing:2}}>✦</span>
            <div style={{flex:1,height:1,background:"rgba(201,168,76,.12)"}}/>
          </div>
          <p style={{textAlign:"center",fontSize:12,color:"rgba(244,237,216,.4)",margin:0}}>
            {mode==="login"?"Don't have an account? ":"Already have an account? "}
            <button onClick={()=>{setMode(m=>m==="login"?"signup":"login");setErr("");}} style={{background:"none",border:"none",cursor:"pointer",color:"#c9a84c",fontFamily:"'Cinzel',serif",fontSize:12,fontWeight:700}}>{mode==="login"?"Sign up free":"Sign in instead"}</button>
          </p>
          {/* Continue as Guest */}
          <button onClick={()=>onGuest&&onGuest()} style={{width:"100%",marginTop:4,background:"transparent",border:"1px solid rgba(201,168,76,.25)",color:"rgba(244,237,216,.6)",cursor:"pointer",borderRadius:10,padding:"11px",fontSize:12,fontFamily:"'Cinzel',serif",fontWeight:600,letterSpacing:.5,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(201,168,76,.06)";e.currentTarget.style.color="#f0d080";}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(244,237,216,.6)";}}>Continue as Guest →</button>
          <p style={{textAlign:"center",fontSize:10.5,color:"rgba(244,237,216,.3)",margin:"8px 0 0",lineHeight:1.4}}>Browse all postings without an account. Sign in any time to unlock match scores, tracking, and alerts.</p>
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
// Slide-over panel shown when a guest clicks the account avatar.
function GuestPanel({onClose,onSignIn}) {
  const mobile=useIsMobile();
  const G="linear-gradient(135deg,#c9a84c,#e8613a)";
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",justifyContent:"flex-end"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div style={{width:"100%",maxWidth:mobile?380:460,height:"100vh",background:"rgba(10,7,14,.97)",borderLeft:"1px solid rgba(201,168,76,.18)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"18px 18px 14px",borderBottom:"1px solid rgba(201,168,76,.1)",flexShrink:0}}>
        <div style={{width:42,height:42,borderRadius:"50%",background:"rgba(201,168,76,.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I.Person s={22} c="rgba(244,237,216,.5)"/></div>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:600,color:"#f4edd8"}}>Guest</div>
          <div style={{fontSize:11,color:"rgba(244,237,216,.4)"}}>Browsing without an account</div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(244,237,216,.4)",cursor:"pointer",fontSize:20,lineHeight:1}}>✕</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"30px 26px",textAlign:"center",gap:16}}>
        <div style={{display:"flex"}}><I.Sword s={40} c="#c9a84c"/></div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:700,color:"#f4edd8"}}>Unlock your full potential</div>
        <p style={{fontSize:13,color:"rgba(244,237,216,.55)",lineHeight:1.6,maxWidth:300,margin:0}}>Sign in or create a free account to unlock your profile, job match scores, application tracking, email templates, and company alerts.</p>
        <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:260,marginTop:6}}>
          {[[<I.Target s={15} c="#c9a84c"/>,"Job match scoring"],[<I.Clipboard s={15} c="#c9a84c"/>,"Application tracking"],[<I.Send s={15} c="#c9a84c"/>,"Saved email templates"],[<I.Bell s={15} c="#c9a84c"/>,"Company job alerts"]].map(([ic,t])=>
            <div key={t} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 13px",background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.1)",borderRadius:9,textAlign:"left"}}>
              <span style={{display:"flex",flexShrink:0}}>{ic}</span><span style={{fontSize:12.5,color:"rgba(244,237,216,.7)"}}>{t}</span>
            </div>)}
        </div>
        <button onClick={onSignIn} style={{width:"100%",maxWidth:260,background:G,border:"none",color:"#0a0608",cursor:"pointer",borderRadius:10,padding:"13px",fontSize:13,fontWeight:800,fontFamily:"'Cinzel',serif",letterSpacing:.5,marginTop:8}}>Sign In or Sign Up →</button>
      </div>
    </div>
  </div>;
}

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
function JobCard({job,user,guest,onRequestLogin,onApplied}) {
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
      {job.salary&&job.salary!=="Salary not listed"&&chip(job.salary,{background:"rgba(232,97,58,.08)",border:"1px solid rgba(232,97,58,.2)",color:"#e8b070"})}
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
    {prompt&&user&&<div style={{background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",borderRadius:8,padding:"9px 13px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8,fontSize:12,color:"rgba(244,237,216,.7)"}}>
      Did you apply?
      <button onClick={()=>confirm(true)} style={{background:"rgba(126,207,179,.15)",border:"1px solid rgba(126,207,179,.35)",color:"#7ecfb3",cursor:"pointer",borderRadius:6,fontSize:11,padding:"4px 12px",fontFamily:"'Cinzel',serif"}}>Yes!</button>
      <button onClick={()=>confirm(false)} style={{background:"rgba(244,237,216,.05)",border:"1px solid rgba(244,237,216,.1)",color:"rgba(244,237,216,.4)",cursor:"pointer",borderRadius:6,fontSize:11,padding:"4px 12px",fontFamily:"inherit"}}>Not yet</button>
    </div>}
    {prompt&&guest&&<div style={{background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.25)",borderRadius:8,padding:"9px 13px",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8,fontSize:12,color:"rgba(244,237,216,.7)"}}>
      Sign up or log in to track this application.
      <button onClick={()=>onRequestLogin&&onRequestLogin()} style={{background:"rgba(201,168,76,.18)",border:"1px solid rgba(201,168,76,.4)",color:"#f0d080",cursor:"pointer",borderRadius:6,fontSize:11,padding:"4px 12px",fontFamily:"'Cinzel',serif",fontWeight:700}}>Sign In</button>
      <button onClick={()=>setPrompt(false)} style={{background:"rgba(244,237,216,.05)",border:"1px solid rgba(244,237,216,.1)",color:"rgba(244,237,216,.4)",cursor:"pointer",borderRadius:6,fontSize:11,padding:"4px 12px",fontFamily:"inherit"}}>Dismiss</button>
    </div>}
    {/* Action buttons */}
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      <button onClick={onApply} style={{background:G,border:"none",color:"#0a0608",cursor:"pointer",borderRadius:7,padding:mobile?"9px 16px":"8px 18px",fontSize:11,fontWeight:800,fontFamily:"'Cinzel',serif",letterSpacing:.5,display:"inline-flex",alignItems:"center",gap:6,flex:mobile?"1":"none",justifyContent:"center"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 4px 16px rgba(201,168,76,.35)";}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>{job.isEmailApply?<><I.Send s={12} c="#0a0608"/>Apply by Email</>:<><I.Arrow s={12} c="#0a0608"/>View &amp; Apply</>}</button>
    </div>
    </div>
    {/* Match score square */}
    {guest&&<div onClick={e=>{e.stopPropagation();onRequestLogin&&onRequestLogin();}} title="Sign up or log in to access this feature" style={{flexShrink:0,width:mobile?58:66,position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,background:"rgba(201,168,76,.05)",border:"1px solid rgba(201,168,76,.18)",borderRadius:10,padding:"6px 4px",alignSelf:"flex-start",cursor:"pointer",overflow:"hidden"}} onMouseEnter={e=>{const t=e.currentTarget.querySelector(".gtip");if(t)t.style.opacity=1;}} onMouseLeave={e=>{const t=e.currentTarget.querySelector(".gtip");if(t)t.style.opacity=0;}}>
      <div style={{filter:"blur(5px)",opacity:.5,display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{fontSize:mobile?17:20,fontWeight:800,color:"#c9a84c",fontFamily:"'Cinzel',serif",lineHeight:1}}>8.4</div>
        <div style={{fontSize:8,color:"#c9a84c",opacity:.7,fontFamily:"'Cinzel',serif"}}>/ 10</div>
        <div style={{fontSize:7,color:"rgba(244,237,216,.4)",textTransform:"uppercase",letterSpacing:.5,marginTop:1}}>Match</div>
      </div>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><I.Lock s={14} c="rgba(201,168,76,.8)"/></div>
      <div className="gtip" style={{position:"absolute",top:"100%",right:0,marginTop:6,width:160,background:"rgba(20,14,10,.98)",border:"1px solid rgba(201,168,76,.4)",borderRadius:8,padding:"8px 10px",fontSize:10,lineHeight:1.4,color:"rgba(244,237,216,.85)",zIndex:100,opacity:0,transition:"opacity .15s",pointerEvents:"none",fontFamily:"system-ui,sans-serif",textAlign:"center"}}>Sign up or log in to access your match score</div>
    </div>}
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
  const [guest,setGuest]=useState(false);
  const [showLoginPopup,setShowLoginPopup]=useState(false);
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
  const guestLogin=u=>{setUser(u);setGuest(false);setShowLoginPopup(false);};
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

  if(!user&&!guest){
    if(!authChecked)return <div style={{minHeight:"100vh",background:"#080608",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"#c9a84c",fontFamily:"'Cinzel',serif",fontSize:14,letterSpacing:1,display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}><I.Sword s={16} c="#c9a84c"/>Loading…</div></div>;
    return <Auth onLogin={login} onGuest={()=>setGuest(true)}/>;
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
    {/* Desktop background globe — large, bottom-left, behind everything */}
    {!mobile&&<div style={{position:"fixed",left:-190,bottom:-190,zIndex:0,pointerEvents:"none",opacity:.6}}><GlobeHeatmap size={720} showStates={true}/></div>}
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
          <span style={{fontSize:20,filter:"drop-shadow(0 0 8px rgba(201,168,76,.5))",display:"inline-flex",alignItems:"center"}}><I.SwordShield s={20} c="#c9a84c"/></span>
          <div><div style={{fontFamily:"'Cinzel',serif",fontSize:7,color:"rgba(201,168,76,.5)",letterSpacing:4,lineHeight:1}}>YOUR CAREER</div><div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:mobile?13:16,fontWeight:700,background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.1}}>Main Quest</div></div>
        </div>
        <nav style={{display:"flex",gap:3,background:"rgba(201,168,76,.05)",border:"1px solid rgba(201,168,76,.12)",borderRadius:10,padding:3}}>
          {[["jobs",<><I.Map s={12} c="currentColor"/><span style={{whiteSpace:"nowrap"}}>{mobile?"Jobs":"Job Board"}</span>{newJobs>0&&<span style={{background:"#c9a84c",color:"#0a0608",borderRadius:20,fontSize:9,padding:"1px 5px",fontWeight:800}}>{newJobs}</span>}</>],["applied",<><I.Scroll s={12} c="currentColor"/><span style={{whiteSpace:"nowrap"}}>{mobile?"Applied":"Job Applications"}</span>{appliedJobs.length>0&&<span style={{background:"#7ecfb3",color:"#080608",borderRadius:20,fontSize:9,padding:"1px 5px",fontWeight:800}}>{appliedJobs.length}</span>}</>]].map(([id,cnt])=>
            <button key={id} onClick={()=>{if(id==="applied"&&guest){setShowLoginPopup(true);return;}setTab(id);}} style={{background:tab===id?gBg:"none",border:tab===id?"1px solid rgba(201,168,76,.25)":"1px solid transparent",cursor:"pointer",color:tab===id?"#f0d080":"rgba(244,237,216,.45)",fontSize:11,fontWeight:600,padding:mobile?"7px 8px":"6px 14px",borderRadius:8,display:"flex",alignItems:"center",gap:5,fontFamily:"'Cinzel',serif",letterSpacing:.3,transition:"all .2s",position:"relative"}}>{cnt}{id==="applied"&&guest&&<I.Lock s={10} c="rgba(244,237,216,.35)"/>}</button>)}
        </nav>
        {!mobile&&<><span style={{fontSize:10,color:"rgba(244,237,216,.3)",fontFamily:"'Cinzel',serif"}}>Synced {lastRefresh.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
        <button onClick={()=>{setLastRefresh(new Date());fetchLiveJobs();}} title="Refresh" style={{background:"none",border:"none",cursor:"pointer",color:"#c9a84c",padding:2,transition:"transform .4s"}} onMouseEnter={e=>e.currentTarget.style.transform="rotate(180deg)"} onMouseLeave={e=>e.currentTarget.style.transform=""}><I.Refresh s={13} c="currentColor"/></button>
        {liveStatus==="fetching"&&<span style={{fontSize:9,color:"rgba(126,207,179,.6)",fontFamily:"'Cinzel',serif"}}>fetching…</span>}
        {liveStatus==="done"&&<span style={{fontSize:9,color:"rgba(126,207,179,.6)",fontFamily:"'Cinzel',serif"}}>● {Object.values(liveJobs).filter(v=>Array.isArray(v)&&v.length>0).length} live</span>}</>
        }
      </div>
      {/* RIGHT: Profile avatar */}
      <button onClick={()=>setShowAcct(true)} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.18)",cursor:"pointer",borderRadius:22,padding:"4px 12px 4px 4px",flexShrink:0}} onMouseEnter={e=>e.currentTarget.style.background="rgba(201,168,76,.1)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(201,168,76,.06)"}>
        <div style={{width:28,height:28,borderRadius:"50%",background:user?G:"rgba(201,168,76,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:user?"#0a0608":"rgba(244,237,216,.5)",fontFamily:"'Cinzel',serif"}}>{user?(user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"?"):<I.Person s={15} c="rgba(244,237,216,.5)"/>}</div>
        {!mobile&&<span style={{fontSize:12,color:"rgba(244,237,216,.6)",fontWeight:500}}>{user?user.name:"Guest"}</span>}
      </button>
    </header>
    {showAcct&&user&&<AccountPanel user={user} onClose={()=>setShowAcct(false)} onUpdate={updateUser} onLogout={logout}/>}
    {showAcct&&!user&&<GuestPanel onClose={()=>setShowAcct(false)} onSignIn={()=>{setShowAcct(false);setShowLoginPopup(true);}}/>}
    {showLoginPopup&&<LoginPopup onClose={()=>setShowLoginPopup(false)} onLogin={guestLogin}/>}

    <main style={{position:"relative",zIndex:1,maxWidth:1100,width:"100%",margin:"0 auto",padding:mobile?"14px 12px":"24px 18px",flex:1}}>
      {tab==="jobs"&&<>
        {/* Mobile globe — centered at top */}
        {mobile&&<div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
          <GlobeHeatmap size={185} showStates={false}/>
        </div>}
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
                                  {user&&(()=>{const isOn=(user.profile?.notifyCompanies||[]).includes(name);const tipText=isOn?"Notifications on for this company":"Turn on job post notifications for this company";
                                    const showTip=(e)=>{const r=e.currentTarget.getBoundingClientRect();let tip=document.getElementById("mq-bell-tooltip");if(!tip){tip=document.createElement("div");tip.id="mq-bell-tooltip";tip.style.cssText="position:fixed;background:rgba(20,14,10,.98);border:1px solid rgba(201,168,76,.35);color:rgba(244,237,216,.9);font-size:11px;line-height:1.35;padding:6px 10px;border-radius:7px;max-width:180px;text-align:center;z-index:9999;pointer-events:none;font-family:system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.5);transition:opacity .12s;";document.body.appendChild(tip);}tip.textContent=tipText;tip.style.opacity="1";const tx=r.left+r.width/2;tip.style.left="0px";tip.style.top="0px";const tw=Math.min(180,tipText.length*6.5+20);tip.style.left=Math.max(8,Math.min(tx-tw/2,window.innerWidth-tw-8))+"px";tip.style.top=(r.top-tip.offsetHeight-8)+"px";};
                                    const hideTip=()=>{const tip=document.getElementById("mq-bell-tooltip");if(tip)tip.style.opacity="0";};
                                    return <span onClick={e=>{e.stopPropagation();hideTip();toggleNotify(name);}} onMouseEnter={showTip} onMouseLeave={hideTip} style={{display:"inline-flex",alignItems:"center",cursor:"pointer",marginLeft:6,opacity:isOn?1:.5,transition:"opacity .15s"}}><I.Bell s={13} c={isOn?"#c9a84c":"rgba(244,237,216,.6)"} fill={isOn?"#c9a84c":"none"}/></span>;})()}
                                  <span style={{flex:1}}/>
                                  {hasNew&&<span style={{width:14,height:14,borderRadius:"50%",background:"#c0321a",display:"flex",alignItems:"center",justifyContent:"center",animation:"pnew 1.5s ease-in-out infinite"}}><I.Alert s={12}/></span>}
                                  {(company.volunteer||fJobs.some(j=>j.isVolunteer||j.type==="Volunteer"))&&<span style={{fontSize:9,color:"#7ecfb3",background:"rgba(126,207,179,.12)",border:"1px solid rgba(126,207,179,.3)",padding:"1px 7px",borderRadius:20,fontFamily:"'Cinzel',serif",fontWeight:700,marginRight:5}}>Volunteer</span>}
                                  {(company.emailApply)&&<span style={{fontSize:9,color:"#e8a070",background:"rgba(232,97,58,.1)",border:"1px solid rgba(232,97,58,.3)",padding:"1px 7px",borderRadius:20,fontFamily:"'Cinzel',serif",fontWeight:700,marginRight:5}}>Email Apply</span>}
                                  {isLive&&<span style={{background:"rgba(126,207,179,.12)",border:"1px solid rgba(126,207,179,.3)",color:"#7ecfb3",borderRadius:20,fontSize:8,padding:"1px 6px",fontWeight:700,marginRight:3}}>● Live</span>}<span style={{fontSize:9,color:"rgba(244,237,216,.35)",background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.1)",padding:"1px 7px",borderRadius:20,fontStyle:noJobs?"italic":"normal"}}>{(()=>{const hasSource=!!ATS_STUDIOS[name];const isLoading=liveJobs[name]===undefined&&hasSource;return isLoading?"Checking…":noJobs?"No openings":`${fJobs.length} opening${fJobs.length!==1?"s":""}`;})()}</span>
                                </button>
                                {expanded[coKey]&&<div style={{padding:"6px 8px 8px",display:"flex",flexDirection:"column",gap:5}}>
                                  {noJobs
                                    ?<NoOpenCard company={company} companyName={name} user={user} onApplied={markApplied}/>
                                    :(()=>{
                                      // Group this studio's jobs by their real location. Only show
                                      // location headers when the studio has jobs in 2+ locations.
                                      const groups={};
                                      for(const j of fJobs){const k=j.locationLabel||"Other";(groups[k]=groups[k]||[]).push(j);}
                                      const keys=Object.keys(groups).sort((a,b)=>{
                                        if(a==="Remote")return 1; if(b==="Remote")return -1;
                                        if(a==="Other")return 1; if(b==="Other")return -1;
                                        return groups[b].length-groups[a].length;
                                      });
                                      const multi=keys.length>1;
                                      const renderJob=j=><JobCard key={j.id} job={j} user={user} guest={guest} onRequestLogin={()=>setShowLoginPopup(true)} onApplied={markApplied}/>;
                                      if(!multi) return fJobs.map(renderJob);
                                      return keys.map(k=>(
                                        <div key={k} style={{display:"flex",flexDirection:"column",gap:5}}>
                                          <div style={{display:"flex",alignItems:"center",gap:6,padding:"2px 2px 1px",marginTop:2}}>
                                            <I.Map s={11} c="rgba(201,168,76,.55)"/>
                                            <span style={{fontSize:10,fontWeight:700,color:"rgba(201,168,76,.7)",fontFamily:"'Cinzel',serif",letterSpacing:.4}}>{k}</span>
                                            <span style={{fontSize:8.5,color:"rgba(244,237,216,.3)"}}>{groups[k].length}</span>
                                            <span style={{flex:1,height:1,background:"rgba(201,168,76,.08)"}}/>
                                          </div>
                                          {groups[k].map(renderJob)}
                                        </div>
                                      ));
                                    })()}
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
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,background:G,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:1,display:"flex",alignItems:"center",gap:8}}><I.Scroll s={20} c="#c9a84c"/>Job Applications</h2>
          {appliedJobs.length>0&&<div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap",paddingTop:mobile?6:4,width:mobile?"100%":"auto"}}>
            <span style={{fontSize:9,color:"rgba(201,168,76,.6)",fontFamily:"'Cinzel',serif",textTransform:"uppercase",letterSpacing:.8}}>Sort:</span>
            {[["date-desc","Date ↓"],["date-asc","Date ↑"],["company","Company"],["title","Role"]].map(([v,l])=><button key={v} onClick={()=>setAppliedSort(v)} style={{background:appliedSort===v?"rgba(201,168,76,.15)":"rgba(201,168,76,.05)",border:`1px solid ${appliedSort===v?"rgba(201,168,76,.4)":"rgba(201,168,76,.12)"}`,color:appliedSort===v?"#f0d080":"rgba(244,237,216,.45)",cursor:"pointer",borderRadius:20,fontSize:10,padding:"3px 12px",fontFamily:"'Cinzel',serif",letterSpacing:.3}}>{l}</button>)}
          </div>}
        </div>
        {appliedJobs.length===0?<div style={{padding:"48px 0",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <span style={{display:"flex"}}><I.Clipboard s={40} c="rgba(201,168,76,.5)"/></span><p style={{color:"rgba(244,237,216,.55)",fontSize:14,fontFamily:"'Cinzel',serif"}}>No applications tracked yet.</p><p style={{color:"rgba(244,237,216,.4)",fontSize:12}}>When you apply and confirm, it'll appear here.</p>
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
                    {[job.type,job.isRemote&&"Remote OK",(job.salary&&job.salary!=="Salary not listed")&&job.salary,`Posted ${job.postedStr}`].filter(Boolean).map((c,i)=><span key={i} style={{background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.15)",borderRadius:20,fontSize:10,padding:"2px 9px",color:"rgba(244,237,216,.6)"}}>{c}</span>)}
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
      <span style={{fontSize:13,color:"#f4edd8",lineHeight:1.5,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6,flexWrap:"wrap"}}><I.Scroll s={13} c="#c9a84c"/>Our <a href="/terms" target="_blank" style={{color:"#c9a84c"}}>Terms of Service</a> and <a href="/privacy" target="_blank" style={{color:"#c9a84c"}}>Privacy Policy</a> have been updated. Please review and agree to continue.</span>
      <button onClick={async()=>{const np={...user.profile,tosVersion:TOS_VERSION};setUser(u=>({...u,profile:np}));if(user?.id){try{await supabase.from("profiles").upsert({id:user.id,name:user.name,data:np},{onConflict:"id"});}catch(e){console.error(e);}}}} style={{background:G,border:"none",color:"#0a0608",cursor:"pointer",borderRadius:8,padding:"8px 22px",fontSize:12,fontWeight:800,fontFamily:"'Cinzel',serif",letterSpacing:.5,flexShrink:0}}>I Agree</button>
    </div>}
  </div>
  </>;
}