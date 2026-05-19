// ─── TugRope.tsx ──────────────────────────────────────────────────────────────
// Rope with animated pullers on each side
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  ropePosition: number;   // -100 to +100
  team1Color: string;
  team2Color: string;
  team1Name: string;
  team2Name: string;
  team1Pullers: string[];
  team2Pullers: string[];
  team1Pulling: boolean;
  team2Pulling: boolean;
  team1Avatar?: string;
  team2Avatar?: string;
}

export function TugRope({
  ropePosition, team1Color, team2Color,
  team1Name, team2Name,
  team1Pullers, team2Pullers,
  team1Pulling, team2Pulling,
  team1Avatar, team2Avatar,
}: Props) {
  // Flag shifts proportionally
  const flagShift = (ropePosition / 100) * 34; // % of container width

  // Pullers lean back when pulling
  const pullLean = 22;

  return (
    <div style={{width:'100%',display:'flex',flexDirection:'column',gap:4,userSelect:'none'}}>

      {/* Progress bar */}
      <div style={{height:8,background:'rgba(255,255,255,0.08)',borderRadius:4,overflow:'hidden',position:'relative',margin:'0 8px'}}>
        <div style={{position:'absolute',left:0,width:'50%',height:'100%',background:`linear-gradient(90deg,${team1Color},${team1Color}55)`}}/>
        <div style={{position:'absolute',right:0,width:'50%',height:'100%',background:`linear-gradient(270deg,${team2Color},${team2Color}55)`}}/>
        <motion.div
          animate={{left:`calc(50% + ${flagShift}%)`}}
          transition={{type:'spring',stiffness:200,damping:20}}
          style={{position:'absolute',top:0,width:4,height:'100%',background:'white',
            borderRadius:2,transform:'translateX(-50%)',boxShadow:'0 0 8px white'}}
        />
      </div>

      {/* Main rope scene */}
      <div style={{position:'relative',height:'clamp(80px,14vw,130px)',display:'flex',alignItems:'center'}}>

        {/* Team 1 pullers — LEFT side, face right, lean back when pulling */}
        <div style={{position:'absolute',left:0,display:'flex',alignItems:'flex-end',gap:'clamp(2px,1vw,6px)',zIndex:2}}>
          {team1Avatar ? (
            <motion.div
              animate={team1Pulling
                ? {rotate:-pullLean, x:[0,-4,0,-4,0]}
                : {rotate:-8, x:0}}
              transition={{duration:0.4,repeat:team1Pulling?3:0}}
              style={{
                display:'inline-flex',
                alignItems:'flex-end',
                transformOrigin:'bottom center',
                filter:team1Pulling?`drop-shadow(0 0 8px ${team1Color})`:'none',
              }}>
              <img 
                src={team1Avatar} 
                alt={team1Name}
                style={{
                  width:'clamp(50px,8vw,90px)',
                  height:'clamp(50px,8vw,90px)',
                  borderRadius:'12px',
                  objectFit:'cover',
                  border:`3px solid ${team1Color}`,
                  boxShadow:`0 0 16px ${team1Color}77`,
                }}
              />
            </motion.div>
          ) : (
            team1Pullers.map((p,i)=>(
              <motion.div key={i}
                animate={team1Pulling
                  ? {rotate:-pullLean, x:[0,-4,0,-4,0]}
                  : {rotate:-8, x:0}}
                transition={{duration:0.4,repeat:team1Pulling?3:0}}
                style={{
                  display:'inline-flex',
                  alignItems:'flex-end',
                  transformOrigin:'bottom center',
                  filter:team1Pulling?`drop-shadow(0 0 8px ${team1Color})`:'none',
                }}>
                <div style={{
                  fontSize:'clamp(1.4rem,3.5vw,2.4rem)',
                  display:'inline-block',
                }}>
                  {p}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Rope SVG */}
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible'}}
          preserveAspectRatio="none" viewBox="0 0 500 80">
          {/* Shadow */}
          <motion.path
            d="M 90 40 Q 250 65 410 40"
            stroke="rgba(0,0,0,0.25)" strokeWidth={12} fill="none" strokeLinecap="round"
          />
          {/* Main rope */}
          <motion.path
            d="M 90 40 Q 250 62 410 40"
            stroke="#C8A96E" strokeWidth={10} fill="none" strokeLinecap="round"
          />
          <motion.path
            d="M 90 37 Q 250 59 410 37"
            stroke="#D4B480" strokeWidth={6} fill="none" strokeLinecap="round"
          />
          <motion.path
            d="M 90 43 Q 250 65 410 43"
            stroke="#B8945A" strokeWidth={5} fill="none" strokeLinecap="round"
          />
          {/* Knots */}
          {[160,250,340].map((x,i)=>(
            <circle key={i} cx={x} cy={52} r={5} fill="#8B6914" opacity={0.8}/>
          ))}
        </svg>

        {/* Centre flag */}
        <motion.div
          animate={{left:`calc(50% + ${flagShift}%)`}}
          transition={{type:'spring',stiffness:180,damping:18}}
          style={{position:'absolute',top:'10%',transform:'translateX(-50%)',
            display:'flex',flexDirection:'column',alignItems:'center',zIndex:5}}>
          <div style={{width:3,height:'clamp(20px,4vw,32px)',background:'#aaa',borderRadius:2}}/>
          <motion.div
            animate={{rotate:[-3,3,-3]}} transition={{repeat:Infinity,duration:1.2}}
            style={{
              background:'linear-gradient(135deg,#FFD700,#FFA000)',
              padding:'3px clamp(6px,1.5vw,12px)',borderRadius:'0 6px 6px 0',
              fontSize:'clamp(0.5rem,1.2vw,0.72rem)',fontWeight:900,
              color:'#1a1a2e',boxShadow:'0 2px 8px rgba(0,0,0,0.3)',
              marginTop:-2,whiteSpace:'nowrap' as const,
            }}>🪢 ROPE</motion.div>
        </motion.div>

        {/* Team 2 pullers — RIGHT side, face left, lean back when pulling */}
        <div style={{position:'absolute',right:0,display:'flex',flexDirection:'row-reverse' as const,
          alignItems:'flex-end',gap:'clamp(2px,1vw,6px)',zIndex:2}}>
          {team2Avatar ? (
            <motion.div
              animate={team2Pulling
                ? {rotate:pullLean, x:[0,4,0,4,0]}
                : {rotate:8, x:0}}
              transition={{duration:0.4,repeat:team2Pulling?3:0}}
              style={{
                display:'inline-flex',
                alignItems:'flex-end',
                transformOrigin:'bottom center',
                filter:team2Pulling?`drop-shadow(0 0 8px ${team2Color})`:'none',
              }}>
              <img 
                src={team2Avatar} 
                alt={team2Name}
                style={{
                  width:'clamp(50px,8vw,90px)',
                  height:'clamp(50px,8vw,90px)',
                  borderRadius:'12px',
                  objectFit:'cover',
                  border:`3px solid ${team2Color}`,
                  boxShadow:`0 0 16px ${team2Color}77`,
                  transform:'scaleX(-1)',
                }}
              />
            </motion.div>
          ) : (
            team2Pullers.map((p,i)=>(
              <motion.div key={i}
                animate={team2Pulling
                  ? {rotate:pullLean, x:[0,4,0,4,0]}
                  : {rotate:8, x:0}}
                transition={{duration:0.4,repeat:team2Pulling?3:0}}
                style={{
                  display:'inline-flex',
                  alignItems:'flex-end',
                  transformOrigin:'bottom center',
                  filter:team2Pulling?`drop-shadow(0 0 8px ${team2Color})`:'none',
                }}>
                <div style={{
                  fontSize:'clamp(1.4rem,3.5vw,2.4rem)',
                  display:'inline-block',
                  transform:'scaleX(-1)',
                }}>
                  {p}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Win zone labels */}
      <div style={{display:'flex',justifyContent:'space-between',padding:'0 8px'}}>
        <span style={{fontSize:'0.65rem',color:team1Color,fontWeight:800,opacity:0.7}}>◀ {team1Name} wins</span>
        <span style={{fontSize:'0.65rem',color:team2Color,fontWeight:800,opacity:0.7}}>{team2Name} wins ▶</span>
      </div>
    </div>
  );
}
