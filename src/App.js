import "./App.css";
import PugAvatar from "./images/pugavatar.png";
import Jaguars from "./images/jaguarfascists2.png";
import Hit from "./images/Bloodspatter.png";
import Lightning from "./images/pugavatar3.png"
import { useState, useEffect } from "react";
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

  //Story progress
  const [storyStage, setStoryStage] = useState(0);

  const progressStory = () => {
    const currentStage = storyStage;
    setStoryStage(currentStage + 1);
    //Here set a stage in which a battle starts ===?
    if (currentStage === 4) {
      const enemyCount = Math.floor(Math.random() * 3) + 4; // 4 to 6 enemies
      const newEnemies = Array.from({ length: enemyCount }, (_, index) => ({
        id: index,
        health: Math.floor(Math.random() * 50) + 50, // health between 50-100
      }));
      setEnemies(newEnemies);
      // Random turn order → enemies + pug
      const totalCombatants = [
        ...newEnemies.map((e) => ({ type: "enemy", id: e.id })),
        { type: "pug", id: "pug" },
      ];
      const shuffledOrder = totalCombatants.sort(() => Math.random() - 0.5);

      setTurnOrder(shuffledOrder);
      setCurrentTurnIndex(0);
      setBattleStarted(true);
    }
  };

  const progressStoryFromBattle = () => {
    const currentStage = storyStage;
    setStoryStage(currentStage + 1);
    setBattleStarted(false);
  };

  //Battle
  const [enemies, setEnemies] = useState([]); // stores enemies
  const [battleStarted, setBattleStarted] = useState(false); // toggles battle mode
  const [turnOrder, setTurnOrder] = useState([]); // Order of enemy attack
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [lastHitDamage, setLastHitDamage] = useState(0); // Used to track blood spatter size

  useEffect(() => {
    if (!battleStarted || turnOrder.length === 0) return;

    const currentCombatant = turnOrder[currentTurnIndex];

    if (currentCombatant.type === "enemy") {
      // PRE-ATTACK phase → trigger blood spatter immediately
      const preAttackDamage = Math.floor(Math.random() * 8) + 1;
      console.log(
        `Enemy ${currentCombatant.id} prepares attack for ${preAttackDamage} damage!`
      );

      setLastHitDamage(preAttackDamage);
      // Clear blood spatter after 2 sec
      const clearHitTimeout = setTimeout(() => {
        setLastHitDamage(0);
      }, 1000); // 2 seconds

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
        setCurrentTurnIndex((prevIndex) => (prevIndex + 1) % turnOrder.length);
      }, 3000);

      return () => clearTimeout(enemyAttackTimeout);
    }
  }, [battleStarted, turnOrder, currentTurnIndex]);

  // Bite attack
  const biteAttack = () => {
    if (turnOrder[currentTurnIndex]?.type !== "pug") return; // Only allow pug on their turn

    const randomValue = Math.floor(Math.random() * 13);
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

      setEnemies(updatedEnemies);
    }
    const advanceTurnTimeout = setTimeout(() => {
      setCurrentTurnIndex((prevIndex) => (prevIndex + 1) % turnOrder.length);
    }, 3000); // 3 second delay
  };

  // Cower attack
  const cowerAttack = () => {
    if (turnOrder[currentTurnIndex]?.type !== "pug") return; // Only allow pug on their turn
    const newHealth = stats.currentHealth + 10;
    stats.currentHealth = newHealth;

    const advanceTurnTimeout = setTimeout(() => {
      setCurrentTurnIndex((prevIndex) => (prevIndex + 1) % turnOrder.length);
    }, 3000); // 3 second delay
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="game-window">
          <div className="player-window">
            <h2>Metropolis</h2>
            <p>Navin</p>
            <div className="avatar-window">
              <img
                src={storyStage < 6 ? PugAvatar : Lightning}
                alt="pug hero"
                className="character-avatar"
              />
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
                marginBottom: "10px",
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
                  onClick={progressStoryFromBattle}
                >
                  Yap
                </button>
                <button
                  className={
                    turnOrder[currentTurnIndex]?.type !== "pug"
                      ? "deactive-pixel-button"
                      : "pixel-button"
                  }
                  onClick={cowerAttack}
                >
                  Cower
                </button>
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
            {/* Enemies */}
            {storyStage === 0 && (
              <div className="narration-display">
                <p>
                  The strong tropical sun bounced off the white stones of the
                  city walls, glinting off the silver trimmed helmets of the
                  snow leopard regiment that manned the outer perimeter of the
                  city down below. Navin sat under the shade of one of the giant
                  Venus fly traps that lined the cobbled pathways of the
                  Prince’s Botanical Gardens. Their green, hairy moisture daubed
                  mouths currently clamped shut against the noonday sun. From
                  where he stood he had a view of the concentric terraces of the
                  Metropolis. The animal kingdom’s one great city. Grey slate
                  and obsidian roofs of administrative buildings jostled
                  together with colourful marketplaces, small courtyards and
                  green fountains, where water gushed from the mouths of marble
                  lions. In the spaces between, brown bears lumbered back and
                  forth with vegetable-laden carts, meerkats leapt upon tables
                  strewn with silverware and bric-a-brac, and every furry or
                  feathered beast in between went about their lives. From this
                  high up, the sounds of carts and cry of hawkers were muffled
                  by the thick humid air. Circling the walls of the city were
                  the green and brown croplands and far far on the horizons
                  edge, the dark grey-green jungle loomed.
                </p>
                <p>
                  Navin was lost in thought. A half-eaten sandwich long left
                  forgotten on the bench next to him. He had exactly ten minutes
                  to get back to his desk before his supervisor noticed him
                  missing. As a pug, Navin excelled as one of the cities best
                  bookkeepers, but that wouldn’t help him if he was late.
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
                  exile to the jungle where, he shuddered, they would diminish,
                  retuning to an untamed relic of a long abandoned way of life.
                </p>
                <p>
                  The truth was he didn’t like what he did. And in fact he
                  thought he’d be very good at something else. Ever since he’d
                  been at the opera to see the Grand Dame Merisma, an otter of
                  superior talent, perform he’d been awestruck by the music. His
                  heart raced at the thrill of the drama, the sets and the
                  searing melodies that filled his belly with fire. It made him
                  think, why couldn’t he have studied to become an opera singer?
                  Why did only otters sing? In Metropolis, as long as Navin
                  could remember, every animal had its role and place.
                </p>
              </div>
            )}

            {storyStage === 2 && (
              <div className="narration-display">
                <p>
                  Big cats were law enforcers, Markets were merchants, bears did
                  physical labour and pugs were good with numbers.
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
                  “It’s not the first time sir! He’s been daydreaming all week!
                  Its’s insubordination sir! Absolutely disrespectful, I have
                  told him time and again…”
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
                  doing, as long as the society functioned as it should. It was
                  the foundation of Metropolis. Harmony was only achieved
                  through every animal playing their prescribed role. It’s what
                  made them civilised and different from the savages that were
                  their animal ancestors. But recently he’d been feeling
                  interested in what others were doing. Could he also sing or
                  play a musical instrument like the otters or chimpanzees? What
                  was stopping him from figuring out how to craft a table, or
                  start a furniture making business like the beavers? Why could
                  only the big cats rule? His left ear tingled, a zing of
                  electricity seemed to leap to his right ear. Navin looked up.
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
                    <h2>*** E N C O U N T E R ***</h2>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 2 }}
                  >
                    <p>
                      Navin felt the cool tip of the spear pressing against his
                      neck.
                    </p>
                    <p>“Know your place, dog.” Utrecht growled.</p>
                    <p>
                      The lush garden was filling fast as more enforces -
                      leopards, jaguars, pumas - leaped silently to form a solid
                      semi-circle which flanked Utrecht. Navin stood alone. A
                      crowd was gathering, other animals peered down from higher
                      terraces. The air was thick with fear and curiosity.
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
                        <div
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
                              transition: "width 0.3s ease",
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
                              ? "Attacku"
                              : index === 0
                              ? "Utrecht"
                              : `Big cat fascist ${index + 1}`}
                          </div>
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
                  <p>
                    “Have you forgotten your station DOG!” Spittle sprayed from
                    Utrechs month. His eyes no longer calm, but wild.
                  </p>
                  <p>
                    Navin heard or rather felt the sizzle as the spit hit the
                    electricity buzzing above his head. He tasted metal. Waves
                    of energy pulsated through his small canine body. His skin
                    crawled as if he would jump out of it.
                  </p>
                  <p>“GET BACK!”</p>
                  <p>
                    In the faces of the enforcers in front of him Navin saw
                    confusion. The deafening roar had come from him. Utrecht
                    alone remained unperturbed “You will pay…”
                  </p>
                </div>
                <img src={Jaguars} alt="jaguars" className="enemy-avatar" />
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
