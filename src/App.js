import "./App.css";
import PugAvatar from "./images/pugavatar.png";
import Jaguars from "./images/jaguarfascists2.png";
import Hit from "./images/Bloodspatter.png";
import Lightning from "./images/pugavatar3.png";
import PugPolar from "./images/pugavatar4.png";
import Fangs from "./images/fangs.png";
import TitleScreen from "./images/titlescreen1.png";
import EndScreen from "./images/Navincontent.png";
import backgroundMusic from "./images/fightbackground.mp3";
import introBackground from "./images/curiousbackground.mp3";
import ominousBackground from "./images/ominousbackground.mp3";
import hurtSound from "./images/hurt.wav";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  //Navin stats
  const [stats, setStats] = useState({
    strength: 2,
    dexterity: 3,
    constitution: 7,
    intelligence: 8,
    wisdom: 8,
    charisma: 4,
    health: 20,
    currentHealth: 20,
  });

  const barColor =
    stats.currentHealth / stats.health > 0.66
      ? "#00ff00"
      : stats.currentHealth / stats.health > 0.33
      ? "#ffff00"
      : "#ff0000";

  //Story stage
  const [storyStage, setStoryStage] = useState(-1);

  //Music and effects

  const hurtAudioRef = useRef(new Audio(hurtSound));
  const playHitSound = () => {
    const audio = hurtAudioRef.current;
    audio.currentTime = 0; // rewind to start
    audio.play().catch((err) => console.warn("Hit sound failed:", err));
  };

  const musicTracks = {
    0: introBackground,
    4: ominousBackground,
    8: backgroundMusic,
    9: introBackground,
  };

  const audioRef = useRef(null);
  const currentTrackUrlRef = useRef(null);

  useEffect(() => {
    const stageKeys = Object.keys(musicTracks)
      .map(Number)
      .sort((a, b) => b - a); // highest to lowest

    const matchingStage = stageKeys.find((key) => storyStage >= key);
    const newTrackUrl =
      matchingStage !== undefined ? musicTracks[matchingStage] : null;

    if (!audioRef.current) return;

    // If track hasn't changed, do nothing
    if (newTrackUrl === currentTrackUrlRef.current) return;

    // Otherwise, switch track
    audioRef.current.pause();
    audioRef.current.src = newTrackUrl || "";
    currentTrackUrlRef.current = newTrackUrl;

    // Wait for user interaction to play if needed (autoplay restrictions)
    const handleUserGesture = () => {
      audioRef.current.play().catch((err) => {
        console.warn("Audio play failed:", err);
      });
      window.removeEventListener("click", handleUserGesture);
    };

    window.addEventListener("click", handleUserGesture);
  }, [storyStage]);
  // useEffect(() => {

  //Battle
  const [enemies, setEnemies] = useState([]); // stores enemies
  const [battleStarted, setBattleStarted] = useState(false); // toggles battle mode
  const [turnOrder, setTurnOrder] = useState([]); // Order of enemy attack
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [lastHitDamage, setLastHitDamage] = useState(0); // Used to track blood spatter size
  const [enemyDamages, setEnemyDamages] = useState({}); //Used to display enemy damage number
  const [battleText, setBattleText] = useState(""); //Text that appears during battles
  const [interactionLocked, setInteractionLocked] = useState(false);

  const showBattleText = (text, duration = 2000, onComplete = () => {}) => {
    setBattleText(text);
    setInteractionLocked(true);

    setTimeout(() => {
      setBattleText("");
      setInteractionLocked(false);
      onComplete(); // advance turn or do next action
    }, duration);
  };

  // progress story if all enemies are defeated
  useEffect(() => {
    const allEnemiesDefeated =
      enemies.length > 0 && enemies.every((enemy) => enemy.health <= 0);

    if (battleStarted && allEnemiesDefeated && storyStage === 8) {
      showBattleText(
        "<p>Navin fell to one knee, dragging Utrecht up by his neck and with his remaining strength turned and flung the captain away from him.</p><p>The look of disbelief was the last Navin would remember of the Chief Enforcer of Metropolis as he silently sailed over the wall to the depths below.</p>",
        12000,
        () => {
          setStoryStage(9);
          setBattleStarted(false);
        }
      );
    }
  }, [enemies, battleStarted, storyStage]);

  const progressStory = () => {
    const currentStage = storyStage;
    setStoryStage(currentStage + 1);
    console.log(currentStage);
    if (currentStage === 4) {
      const enemyCount = Math.floor(Math.random() * 3) + 4; // 4 to 6 enemies
      const newEnemies = Array.from({ length: enemyCount }, (_, index) => ({
        id: index,
        health: Math.floor(Math.random() * 50) + 50, // health between 50-100
      }));
      setEnemies(newEnemies);

      const totalCombatants = [
        ...newEnemies.map((e) => ({ type: "enemy", id: e.id })),
        { type: "pug", id: "pug" },
      ];
      const shuffledOrder = totalCombatants.sort(() => Math.random() - 0.5);
      setTurnOrder(shuffledOrder);
      setCurrentTurnIndex(0);
      setBattleStarted(true);
    }

    if (currentStage === 6) {
      setStats({
        strength: 15,
        dexterity: 3,
        constitution: 7,
        intelligence: 8,
        wisdom: 8,
        charisma: 14,
        health: 100,
        currentHealth: 100,
      });
    }

    if (currentStage === 7) {
      setBattleStarted(true);
    }
  };

  useEffect(() => {
    if (!battleStarted || turnOrder.length === 0) return;
    // STOP processing if currentHealth < 5
    if (stats.currentHealth < 5) {
      if (storyStage === 5) {
        setStoryStage(6);
      }
      setBattleStarted(false); // stop battle mode
      return; // EXIT effect → prevents new attacks
    }

    const currentCombatant = turnOrder[currentTurnIndex];
    if (!currentCombatant) return;

    if (currentCombatant.type === "enemy") {
      // PRE-ATTACK phase → trigger blood spatter immediately
      const preAttackDamage = Math.floor(Math.random() * 4) + 1;
      console.log(
        `Enemy ${currentCombatant.id} prepares attack for ${preAttackDamage} damage!`
      );

      setLastHitDamage(preAttackDamage);
      // Play hit sound
      playHitSound();
      // Clear blood spatter after 2 sec
      const clearHitTimeout = setTimeout(() => {
        setLastHitDamage(0);
      }, 1000); // 1 seconds

      // ATTACK phase → after 5 sec
      const enemyAttackTimeout = setTimeout(() => {
        setStats((prevStats) => ({
          ...prevStats,
          currentHealth: Math.max(0, prevStats.currentHealth - preAttackDamage),
        }));

        console.log(
          `Enemy ${currentCombatant.id} deals ${preAttackDamage} damage!`
        );

        // Move to next turn
        setTimeout(() => {
          safeAdvanceTurn();
        });
      }, 2000);

      return () => clearTimeout(enemyAttackTimeout);
    }
  }, [battleStarted, turnOrder, currentTurnIndex]);

  // ATTACKS
  //Function to pass to next turn in combat
  const safeAdvanceTurn = () => {
    setCurrentTurnIndex((prevIndex) => {
      const newTurnOrderLength = turnOrder.length;
      if (newTurnOrderLength === 0) return 0;
      const nextIndex = (prevIndex + 1) % newTurnOrderLength;
      return nextIndex;
    });
  };
  useEffect(() => {
    if (currentTurnIndex >= turnOrder.length && turnOrder.length > 0) {
      setCurrentTurnIndex(0);
    }
  }, [turnOrder, currentTurnIndex]);

  //BITE ATTACK
  const [biteBattleText, setBiteBattleText] = useState(false);
  const biteAttack = () => {
    if (interactionLocked || turnOrder[currentTurnIndex]?.type !== "pug")
      return;

    const randomValue = Math.floor(Math.random() * 7 * stats.strength);
    console.log(`Bite attack roll: ${randomValue}`);

    if (randomValue === 0) {
      console.log("Miss!");
    } else {
      let damage = randomValue * stats.strength;
      if (randomValue === 12) {
        console.log("Critical hit!");
        damage *= 2;
      } else {
        console.log("Hit!");
      }

      const livingEnemies = enemies.filter((enemy) => enemy.health > 0);
      if (livingEnemies.length === 0) {
        console.log("No enemies left!");
        return;
      }

      const randomEnemyIndex = Math.floor(Math.random() * livingEnemies.length);
      const targetEnemyId = livingEnemies[randomEnemyIndex].id;

      const updatedEnemies = enemies.map((enemy) => {
        if (enemy.id === targetEnemyId) {
          const newHealth = Math.max(0, enemy.health - damage);
          console.log(
            `Enemy ${enemy.id + 1} takes ${damage.toFixed(
              2
            )} damage! New health: ${newHealth.toFixed(2)}`
          );
          return { ...enemy, health: newHealth };
        }
        return enemy;
      });

      // First show updatedEnemies → so animation runs
      setEnemies(updatedEnemies);
      // Play hit sound
      playHitSound();
      // Show damage number:
      setEnemyDamages({ [targetEnemyId]: damage });

      // After 1 sec → clear damage AND THEN remove dead enemies
      setTimeout(() => {
        setEnemyDamages({});

        setEnemies(updatedEnemies);

        // NEW: update turn order to exclude defeated enemies
        const updatedTurnOrder = turnOrder.filter((combatant) => {
          if (combatant.type === "enemy") {
            const matchedEnemy = updatedEnemies.find(
              (e) => e.id === combatant.id
            );
            return matchedEnemy && matchedEnemy.health > 0;
          }
          return true; // keep pug
        });
        setTurnOrder(updatedTurnOrder);
        setCurrentTurnIndex((prevIndex) =>
          Math.min(prevIndex, updatedTurnOrder.length - 1)
        );
      }, 1000); // match damage display time
    }
    const isPolarBear = storyStage >= 7 && !biteBattleText;
    const delay = isPolarBear ? 11000 : 3000;
    if (!biteBattleText && storyStage >= 7) {
      showBattleText(
        "<p> As a bear, Navin felt intoxicated. Unstoppable. He could crush his enemies with one swipe, he could pin him down and rip out his throat with his powerful teeth. He felt his blood pumping, his sight was sharp. He was free and could take the shape and skill of any animal.</p>",
        delay,
        safeAdvanceTurn
      );
      setBiteBattleText(true);
    } else {
      // Just progress without the bear battle text
      showBattleText("", delay, safeAdvanceTurn);
    }
  };

  // Cower attack
  const cowerAttack = () => {
    if (turnOrder[currentTurnIndex]?.type !== "pug") return; // Only allow pug on their turn
    const newHealth = stats.currentHealth + 5 * stats.strength;
    stats.currentHealth = newHealth;

    const advanceTurnTimeout = setTimeout(() => {
      setCurrentTurnIndex((prevIndex) => (prevIndex + 1) % turnOrder.length);
    }, 3000); // 3 second delay
  };

  //Swipe attack

  const [swipeBattleText, setSwipeBattleText] = useState(false);
  const swipeAttack = () => {
    if (interactionLocked || turnOrder[currentTurnIndex]?.type !== "pug");

    const livingEnemies = enemies.filter((enemy) => enemy.health > 0);
    if (livingEnemies.length === 0) {
      console.log("No enemies left!");
      return;
    }

    const randomEnemyIndex = Math.floor(Math.random() * livingEnemies.length);
    const firstTargetId = livingEnemies[randomEnemyIndex].id;
    const secondTargetId =
      livingEnemies[(randomEnemyIndex + 1) % livingEnemies.length].id;

    const randomValue = Math.floor(Math.random() * 4 * stats.strength);
    console.log(`Swipe attack roll: ${randomValue}`);

    if (randomValue === 0) {
      console.log("Miss!");
    } else {
      const damage = randomValue * stats.strength;

      console.log(
        `Enemy ${firstTargetId + 1} and Enemy ${
          secondTargetId + 1
        } each take ${damage.toFixed(2)} damage!`
      );

      const updatedEnemies = enemies.map((enemy) => {
        if (enemy.id === firstTargetId || enemy.id === secondTargetId) {
          const newHealth = Math.max(0, enemy.health - damage);
          return { ...enemy, health: newHealth };
        }
        return enemy;
      });

      // First show updatedEnemies → animate health bar
      setEnemies(updatedEnemies);
      // Play hit sound
      playHitSound();
      // Show damage numbers
      setEnemyDamages({
        [firstTargetId]: damage,
        [secondTargetId]: damage,
      });

      // After 1 sec → clear damage AND THEN remove dead enemies
      setTimeout(() => {
        setEnemyDamages({});

        setEnemies(updatedEnemies);

        // NEW: update turn order to exclude defeated enemies
        const updatedTurnOrder = turnOrder.filter((combatant) => {
          if (combatant.type === "enemy") {
            const matchedEnemy = updatedEnemies.find(
              (e) => e.id === combatant.id
            );
            return matchedEnemy && matchedEnemy.health > 0;
          }
          return true; // keep pug
        });
        setTurnOrder(updatedTurnOrder);
        setCurrentTurnIndex((prevIndex) =>
          Math.min(prevIndex, updatedTurnOrder.length - 1)
        );
      }, 2000); // match damage display time
    }

    const isPolarBear = storyStage >= 7 && !swipeBattleText;
    const delay = isPolarBear ? 12000 : 3000;
    if (!swipeBattleText && storyStage >= 7) {
      showBattleText(
        "<p>Navin spun and in one movement sent two cats flying with the back of his paw. The others screamed. Spears and shields clanked to the ground as enforcers looked for an escape.</p> <p>“Fools, cowards! Fight him!” Utrecht, knocked over in the melee, was frantically scrambling backwards, pointing at Navin.</p>",
        delay,
        safeAdvanceTurn
      );
      setSwipeBattleText(true);
    } else {
      showBattleText("", delay, safeAdvanceTurn);
    }
  };

  const [yapBattleText, setYapBattleText] = useState(false);
  const yapAttack = () => {
    if (interactionLocked || turnOrder[currentTurnIndex]?.type !== "pug");

    const livingEnemies = enemies.filter((enemy) => enemy.health > 0);
    if (livingEnemies.length === 0) {
      console.log("No enemies left!");
      return;
    }

    const baseDamage = Math.floor(Math.random() * stats.charisma) + 1; // Roll 1-6
    const damage = baseDamage * 3;

    console.log(
      `Yap attack hits ALL enemies for ${damage.toFixed(2)} damage each!`
    );

    const updatedEnemies = enemies.map((enemy) => {
      if (enemy.health > 0) {
        const newHealth = Math.max(0, enemy.health - damage);
        return { ...enemy, health: newHealth };
      }
      return enemy;
    });

    // First show updatedEnemies → animate health bars
    setEnemies(updatedEnemies);
    // Play hit sound
    playHitSound();
    // Show damage numbers per enemy
    const damageMap = {};
    livingEnemies.forEach((enemy) => {
      damageMap[enemy.id] = damage;
    });
    setEnemyDamages(damageMap);

    // After 1 sec → clear damage AND THEN remove dead enemies
    setTimeout(() => {
      setEnemyDamages({});

      setEnemies(updatedEnemies);

      // NEW: update turn order to exclude defeated enemies
      const updatedTurnOrder = turnOrder.filter((combatant) => {
        if (combatant.type === "enemy") {
          const matchedEnemy = updatedEnemies.find(
            (e) => e.id === combatant.id
          );
          return matchedEnemy && matchedEnemy.health > 0;
        }
        return true; // keep pug
      });
      setTurnOrder(updatedTurnOrder);
      setCurrentTurnIndex((prevIndex) =>
        Math.min(prevIndex, updatedTurnOrder.length - 1)
      );
    }, 1000); // match damage display time

    const isPolarBear = storyStage >= 7 && !yapBattleText;
    const delay = isPolarBear ? 11000 : 3000;

    if (!yapBattleText && storyStage >= 7) {
      showBattleText(
        "<p>A ceramic plate smashed on the cobble stones between Navin and Utrecht.</p><p>This time mighty cheer rose from the crowds. Pots, rocks and wooden barrels were hurtling down on the enforcers from above. Every animal that had come to watch the fray was having a crack.</p>",
        delay,
        safeAdvanceTurn
      );
      setYapBattleText(true);
    } else {
      showBattleText("", delay, safeAdvanceTurn);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {storyStage >= 0 && storyStage < 10 ? (
          <div className="game-window">
            <div className="player-window">
              <p>Navin</p>
              <div className="avatar-window">
                {storyStage < 6 || storyStage === 9 ? (
                  <motion.img
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    src={PugAvatar}
                    alt="pug hero"
                    className="character-avatar"
                  />
                ) : storyStage === 6 ? (
                  <AnimatePresence>
                    <motion.img
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      src={Lightning}
                      alt="pug hero"
                      className="character-avatar"
                    />
                  </AnimatePresence>
                ) : storyStage === 7 || storyStage === 8 ? (
                  <AnimatePresence>
                    {" "}
                    <motion.img
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      src={PugPolar}
                      alt="pug hero"
                      className="character-avatar"
                    />
                  </AnimatePresence>
                ) : null}

                <AnimatePresence>
                  {lastHitDamage > 0 && (
                    <motion.img
                      key="blood-spatter"
                      src={Hit}
                      alt="hit"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{
                        opacity: 1,
                        scale: Math.min(1.5, 0.5 + lastHitDamage / 10), // scale varies with damage
                      }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.3 }}
                      className="hit-icon"
                    />
                  )}
                </AnimatePresence>
              </div>
              <div
                className="pug-health-bar"
                style={{
                  height: "20px",
                  width: "100px",
                  backgroundColor: barColor,
                }}
              ></div>
              {/* Buttons */}
              {!battleStarted ? (
                <button className="pixel-button" onClick={progressStory}>
                  Continue
                </button>
              ) : (
                <div className="abilities-menu">
                  <button
                    className={
                      turnOrder[currentTurnIndex]?.type !== "pug"
                        ? "deactive-pixel-button"
                        : "pixel-button"
                    }
                    onClick={yapAttack}
                  >
                    {stats.strength < 5 ? "Yap" : "Roar"}
                  </button>
                  <button
                    className={
                      turnOrder[currentTurnIndex]?.type !== "pug"
                        ? "deactive-pixel-button"
                        : "pixel-button"
                    }
                    onClick={swipeAttack}
                  >
                    swipe
                  </button>
                  {/* <button
                    className={
                      turnOrder[currentTurnIndex]?.type !== "pug"
                        ? "deactive-pixel-button"
                        : "pixel-button"
                    }
                    onClick={cowerAttack}
                  >
                    {stats.strength < 5 ? "Cower" : "Rest"}
                  </button> */}
                  <button
                    className={
                      turnOrder[currentTurnIndex]?.type !== "pug"
                        ? "deactive-pixel-button"
                        : "pixel-button"
                    }
                    onClick={biteAttack}
                  >
                    Bite
                  </button>
                </div>
              )}
            </div>

            <div className="main-display">
              {storyStage === 0 && (
                <div className="narration-display">
                  <p>
                    The strong tropical sun bounced off the white stones of the
                    city walls, glinting off the silver trimmed helmets of the
                    snow leopard regiment that manned the outer perimeter of the
                    city down below. Navin sat under the shade of one of the
                    giant Venus fly traps that lined the cobbled pathways of the
                    Prince’s Botanical Gardens. Their green, hairy moisture
                    daubed mouths currently clamped shut against the noonday
                    sun. From where he stood he had a view of the concentric
                    terraces of the Metropolis. The animal kingdom’s one great
                    city. Grey slate and obsidian roofs of administrative
                    buildings jostled together with colourful marketplaces,
                    small courtyards and green fountains, where water gushed
                    from the mouths of marble lions. In the spaces between,
                    brown bears lumbered back and forth with vegetable-laden
                    carts, meerkats leapt upon tables strewn with silverware and
                    bric-a-brac, and every furry or feathered beast in between
                    went about their lives. From this high up, the sounds of
                    carts and cry of hawkers were muffled by the thick humid
                    air. Circling the walls of the city were the green and brown
                    croplands and far far on the horizons edge, the dark
                    grey-green jungle loomed.
                  </p>
                  <p>
                    Navin was lost in thought. A half-eaten sandwich long left
                    forgotten on the bench next to him. He had exactly ten
                    minutes to get back to his desk before his supervisor
                    noticed him missing. As a pug, Navin excelled as one of the
                    cities best bookkeepers, but that wouldn’t help him if he
                    was late.
                  </p>
                </div>
              )}

              {storyStage === 1 && (
                <div className="narration-display">
                  <p>
                    “I can’t do it anymore” Navin said to himself. It was not
                    talked about openly, but Navin was aware of experiencing
                    something over the last few months that animals whispered
                    about but didn’t dare act upon, lest they were punished by
                    exile to the jungle where, he shuddered, they would
                    diminish, retuning to an untamed relic of a long abandoned
                    way of life.
                  </p>
                  <p>
                    The truth was he didn’t like what he did. And in fact he
                    thought he’d be very good at something else. Ever since he’d
                    been at the opera to see the Grand Dame Merisma, an otter of
                    superior talent, perform he’d been awestruck by the music.
                    His heart raced at the thrill of the drama, the sets and the
                    searing melodies that filled his belly with fire. It made
                    him think, why couldn’t he have studied to become an opera
                    singer? Why did only otters sing? In Metropolis, as long as
                    Navin could remember, every animal had its role and place.
                  </p>
                </div>
              )}

              {storyStage === 2 && (
                <div className="narration-display">
                  <p>
                    Big cats were law enforcers, Markets were merchants, bears
                    did physical labour and pugs were good with numbers.
                  </p>
                  <p>
                    {" "}
                    “What are you doing here bookkeeper?” A deep melodious voice
                    that rolled right through him, an unstoppable wave of sound
                    that made his hackles rise.{" "}
                  </p>
                  <p>
                    {" "}
                    Navin slowly turned around, ears involuntarily flattening as
                    he saw who it was. He looked down at the leopard’s booted
                    paws. “Captain Utrecht, I, I lost track of time, my deepest
                    apologies it won’t happen again.”
                  </p>
                  <p>
                    {" "}
                    Utrecht, leant languidly on his spear, fixing Navin with a
                    dark stare, his mirthless red mouth, sharp white teeth
                    exposed, turned upwards at the edges. His spotted black and
                    white tail swished back and forth of its own accord. To his
                    left, fanning herself with a large palm frond was Meredith,
                    his supervisor. Nervously panting.
                  </p>
                  <p>
                    {" "}
                    “It’s not the first time sir! He’s been daydreaming all
                    week! Its’s insubordination sir! Absolutely disrespectful, I
                    have told him time and again…”
                  </p>{" "}
                  <p>“Thsss” Ultrech cut her off. “Fool!”</p>
                </div>
              )}

              {storyStage === 3 && (
                <div className="narration-display">
                  <p>
                    “Do you think I haven’t heard about what you’ve been up to,
                    pug?”
                  </p>
                  <p>
                    Navin’s mind was buzzing. Up until a couple of months ago,
                    Navin was like any other middle-aged pug with a steady
                    profession. He clocked in and out of the bookkeeping office
                    everyday. He took little interest in what other animals were
                    doing, as long as the society functioned as it should. It
                    was the foundation of Metropolis. Harmony was only achieved
                    through every animal playing their prescribed role. It’s
                    what made them civilised and different from the savages that
                    were their animal ancestors. But recently he’d been feeling
                    interested in what others were doing. Could he also sing or
                    play a musical instrument like the otters or chimpanzees?
                    What was stopping him from figuring out how to craft a
                    table, or start a furniture making business like the
                    beavers? Why could only the big cats rule? His left ear
                    tingled, a zing of electricity seemed to leap to his right
                    ear. Navin looked up.
                  </p>
                  <p>“It’s none of your business.”</p>
                </div>
              )}

              {storyStage === 4 && (
                <div className="battle-display">
                  <div className="encounter-display">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <h1>*** E N C O U N T E R ***</h1>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.5, delay: 2 }}
                    >
                      <p>
                        Navin felt the cool tip of the spear pressing against
                        his neck.
                      </p>
                      <p className="enemy-dialogue">“Know your place, dog.”</p>
                      <p>
                        Utrecht growled. The lush garden was filling fast as
                        more enforces - leopards, jaguars, pumas - leaped
                        silently to form a solid semi-circle which flanked
                        Utrecht. Navin stood alone. A crowd was gathering, other
                        animals peered down from higher terraces. The air was
                        thick with fear and curiosity.
                      </p>
                    </motion.div>
                  </div>
                  <img src={Jaguars} alt="jaguars" className="enemy-avatar" />
                </div>
              )}

              {battleStarted && storyStage === 5 && (
                <div className="battle-display">
                  <>
                    <div className="enemy-list">
                      {enemies.map((enemy, index) => {
                        const isEnemyTurn =
                          turnOrder[currentTurnIndex]?.type === "enemy" &&
                          turnOrder[currentTurnIndex]?.id === enemy.id;

                        return (
                          <div className="damage-counter">
                            <div className="enemy-ishit-icon">
                              {enemyDamages[enemy.id] ? (
                                <AnimatePresence>
                                  <motion.img
                                    initial={{ opacity: 1, scale: 1 }}
                                    animate={{ opacity: 1, scale: [1, 1.2, 1] }}
                                    transition={{
                                      duration: 1,
                                      times: [0, 0.4, 0.5],
                                    }}
                                    src={Fangs}
                                    className="fangs-icon"
                                  />
                                </AnimatePresence>
                              ) : (
                                ""
                              )}
                              <p className="damage">{enemyDamages[enemy.id]}</p>
                            </div>
                            <motion.div
                              layout
                              transition={{ type: "spring", duration: 1 }}
                              key={enemy.id}
                              className="enemy-bar"
                              style={{
                                border: isEnemyTurn
                                  ? "3px solid yellow"
                                  : "1px solid white",
                                padding: "5px",
                                marginBottom: "10px",
                              }}
                            >
                              <div
                                style={{
                                  backgroundColor: "white",
                                  height: "20px",
                                  width: `${enemy.health}%`,
                                  transition: "width 0.3s ease 0.4s",
                                  opacity: enemy.health > 0 ? 1 : 0.3,
                                }}
                              />
                              <div
                                style={{
                                  color: "white",
                                  marginTop: "5px",
                                  textAlign: "center",
                                }}
                              >
                                {isEnemyTurn
                                  ? "Attack"
                                  : index === 0
                                  ? "Utrecht"
                                  : `Big cat fascist ${index + 1}`}
                              </div>
                            </motion.div>
                          </div>
                        );
                      })}
                    </div>
                    <img src={Jaguars} alt="jaguars" className="enemy-avatar" />
                  </>
                </div>
              )}

              {storyStage === 6 && (
                <div className="battle-display">
                  <div className="encounter-display">
                    <p className="enemy-dialogue">
                      “Have you forgotten your station DOG!”
                    </p>
                    <p>
                      Spittle sprayed from Utrechs month. His eyes no longer
                      calm, but wild.
                    </p>
                    <p>
                      Navin heard or rather felt the sizzle as the spit hit the
                      electricity buzzing above his head. He tasted metal. Waves
                      of energy pulsated through his small canine body. His skin
                      crawled as if he would jump out of it.
                    </p>
                    <h1 className="hero-dialogue">“GET BACK!”</h1>
                    <p>
                      In the faces of the enforcers in front of him Navin saw
                      confusion. The deafening roar had come from him. Utrecht
                      alone remained unperturbed,
                    </p>
                    <p className="enemy-dialogue2">“You will pay…”</p>
                  </div>
                  <img src={Jaguars} alt="jaguars" className="enemy-avatar" />
                </div>
              )}

              {storyStage === 7 && (
                <div className="battle-display">
                  <div className="encounter-display">
                    <p>
                      His chest was bursting, heart pounding. Navin roared
                      again, but this was a powerful, deep and primal roar. It
                      came from deep within his stomach. With one powerful arm
                      he knocked the spear away as if it were kindling. His body
                      was transformed, his broad chest now covered in white
                      thick fur and standing on his powerful hind legs Navin was
                      three times as big as the enforcers who milled below him.
                      A polar bear.
                    </p>
                    <h2 className="enemy-dialogue2">“Get him!”</h2>
                    <p>
                      Utrecht was already turning to flee but a few of the
                      braver enforcers came forward.
                    </p>
                  </div>
                  <img src={Jaguars} alt="jaguars" className="enemy-avatar" />
                </div>
              )}

              {battleStarted && storyStage === 8 && (
                <div className="battle-display">
                  <>
                    <div className="enemy-list">
                      {enemies.map((enemy, index) => {
                        const isEnemyTurn =
                          turnOrder[currentTurnIndex]?.type === "enemy" &&
                          turnOrder[currentTurnIndex]?.id === enemy.id;

                        return (
                          <div className="damage-counter">
                            <div className="enemy-ishit-icon">
                              {enemyDamages[enemy.id] ? (
                                <AnimatePresence>
                                  <motion.img
                                    initial={{ opacity: 1, scale: 1.5 }}
                                    animate={{
                                      opacity: 1,
                                      scale: [1.5, 1.7, 1],
                                    }}
                                    transition={{
                                      duration: 1,
                                      times: [0, 0.4, 0.5],
                                    }}
                                    src={Fangs}
                                    className="fangs-icon-bear"
                                  />
                                </AnimatePresence>
                              ) : (
                                ""
                              )}
                              <p className="damage-polar">
                                {enemyDamages[enemy.id]}
                              </p>
                            </div>
                            <motion.div
                              key={enemy.id}
                              layout
                              transition={{ type: "spring", duration: 1 }}
                              className="enemy-bar"
                              style={{
                                border: isEnemyTurn
                                  ? "3px solid yellow"
                                  : "1px solid white",
                                padding: "5px",
                                marginBottom: "10px",
                                display: enemy.health > 0 ? "" : "none",
                              }}
                            >
                              <div
                                style={{
                                  backgroundColor: "white",
                                  height: "20px",
                                  width: `${enemy.health}%`,
                                  transition: "width 0.3s ease 0.4s",
                                }}
                              />
                              <div
                                style={{
                                  color: "white",
                                  marginTop: "5px",
                                  textAlign: "center",
                                }}
                              >
                                {isEnemyTurn
                                  ? "Attack"
                                  : index === 0
                                  ? "Utrecht"
                                  : `Big cat fascist ${index + 1}`}
                              </div>
                            </motion.div>
                          </div>
                        );
                      })}
                    </div>
                    {battleText ? (
                      <div className="enemy-avatar enemy-battle-dialogue-wrapper">
                        <div
                          className="enemy-battle-dialogue"
                          dangerouslySetInnerHTML={{ __html: battleText }}
                        ></div>
                      </div>
                    ) : (
                      <img
                        src={Jaguars}
                        alt="jaguars"
                        className="enemy-avatar"
                      />
                    )}
                  </>
                </div>
              )}

              {storyStage === 9 && (
                <div className="narration-display">
                  <p>
                    Navin hummed to himself as he opened the oven. The smell of
                    freshly baked bread filled the room as he set the loaf on
                    his newly crafted wooden dining table.
                  </p>
                  <p>
                    There had been some upheaval over the past few moths and
                    years. Metropolis was not the place it used to be. In fact
                    it was severely disordered.
                  </p>
                  <p>
                    Navin was no longer a bookkeeper, but enrolled at the
                    Academy of Arts for adult singing lessons under the tutelage
                    of Madame Marisma. He may never be an opera singer of such
                    renown, but there was something in being able to dream.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : storyStage === -1 ? (
          <div className="title-screen">
            <h1>The Metropolis</h1>
            <img
              src={TitleScreen}
              alt="jaguars"
              className="title-screen-image"
            />
            <button className="pixel-button" onClick={progressStory}>
              Continue
            </button>
          </div>
        ) : storyStage === 10 ? (
          <div className="title-screen">
            <img src={EndScreen} alt="jaguars" className="title-screen-image" />
            <p>Thank you for playing Dale.</p>
          </div>
        ) : null}
      </header>
      <audio ref={audioRef} loop />
    </div>
  );
}

export default App;
