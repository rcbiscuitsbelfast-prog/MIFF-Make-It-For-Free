console.log("🌿 Welcome to Spirit Tamer: Trial of the Grove");
console.log("🧙‍♀️ You begin your journey at the Grove Heart...");

const npcList = ["Elder Moss", "Cloudtail", "Whispering Wren", "Fae Sentinel", "Trial Spirit", "Grovekeeper"];
const questList = ["Grove Initiation", "Trial of Courage", "Spirit Bonding"];

npcList.forEach(npc => {
  console.log(`🗣️ Interacting with ${npc}...`);
  });

  questList.forEach(quest => {
    console.log(`🎯 Quest started: ${quest}`);
      console.log(`✅ Quest completed: ${quest}`);
      });

      console.log("🎉 You’ve completed all trials and earned the Grovekeeper’s Crest.");
      console.log("🔄 Ready for remix, expansion, or multi-agent playtesting.");