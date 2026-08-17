import{r as o,j as e,L as b}from"./index-D7uWj47q.js";const v=new Date("2026-08-05T00:00:00").getTime();function x(){const i=new Date().getTime(),n=v-i;return n<0?{days:0,hours:0,minutes:0,seconds:0,launched:!0}:{days:Math.floor(n/(1e3*60*60*24)),hours:Math.floor(n%(1e3*60*60*24)/(1e3*60*60)),minutes:Math.floor(n%(1e3*60*60)/(1e3*60)),seconds:Math.floor(n%(1e3*60)/1e3),launched:!1}}function d(i){return String(i).padStart(2,"0")}function j(){const[i,n]=o.useState([]),[a,h]=o.useState(x()),[p,m]=o.useState(!1);o.useEffect(()=>{const s=Array.from({length:80},(S,y)=>({id:y,top:`${Math.random()*100}%`,left:`${Math.random()*100}%`,delay:`${Math.random()*3}s`}));n(s)},[]),o.useEffect(()=>{const s=setInterval(()=>{h(x())},1e3);return()=>clearInterval(s)},[]);const u="#050b18",f="#0b1730",g="#1e9be0",t="#e6b23c";return e.jsxs("div",{style:{position:"relative",height:"100vh",width:"100%",overflow:"hidden",display:"flex",flexDirection:"column",background:`radial-gradient(ellipse at 50% 20%, ${f}, ${u} 70%)`,color:"#f5f5f5",fontFamily:"'Segoe UI', Arial, sans-serif"},children:[e.jsx("style",{children:`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.9; }
        }
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        .cs-star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #f5f5f5;
          border-radius: 50%;
          opacity: 0.6;
          animation: twinkle 3s infinite ease-in-out;
        }
        .cs-signin-btn:hover {
          background: #e6b23c !important;
          color: #050b18 !important;
          transform: scale(1.05);
        }
        @media (max-width: 480px) {
          .cs-countdown {
            flex-wrap: nowrap !important;
            justify-content: space-between !important;
            gap: 6px !important;
            width: 100% !important;
          }
          .cs-unit {
            flex: 1 !important;
            min-width: 0 !important;
            padding: 10px 4px !important;
            border-radius: 10px !important;
          }
          .cs-unit .cs-num {
            font-size: 22px !important;
          }
          .cs-unit .cs-label {
            font-size: 10px !important;
            letter-spacing: 1px !important;
          }
          .cs-logo-wrap img {
            height: 70px !important;
          }
          .cs-h1 {
            font-size: 26px !important;
          }
          .cs-sub {
            font-size: 13px !important;
            margin-bottom: 16px !important;
            padding: 0 10px !important;
          }
        }
      `}),e.jsx("div",{onMouseEnter:()=>m(!0),onMouseLeave:()=>m(!1),style:{position:"fixed",top:0,right:0,width:140,height:70,zIndex:10,display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(b,{to:"/sign-in",className:"cs-signin-btn",style:{opacity:p?1:0,visibility:p?"visible":"hidden",padding:"8px 18px",borderRadius:20,border:`1px solid ${t}`,background:"rgba(11, 23, 48, 0.8)",color:t,fontSize:13,fontWeight:600,textDecoration:"none",backdropFilter:"blur(4px)",transition:"opacity 0.3s ease, visibility 0.3s ease, transform 0.2s ease",cursor:"pointer"},children:"Sign In"})}),e.jsx("div",{style:{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"},children:i.map(s=>e.jsx("div",{className:"cs-star",style:{top:s.top,left:s.left,animationDelay:s.delay}},s.id))}),e.jsx("div",{style:{position:"fixed",top:"50%",left:"50%",width:"min(900px, 90vh)",height:"min(900px, 90vh)",transform:"translate(-50%, -50%)",border:"1px solid rgba(30, 155, 224, 0.15)",borderRadius:"50%",animation:"spin 40s linear infinite",zIndex:0}}),e.jsx("div",{style:{position:"fixed",top:"50%",left:"50%",width:"min(600px, 60vh)",height:"min(600px, 60vh)",transform:"translate(-50%, -50%)",border:"1px solid rgba(230, 178, 60, 0.15)",borderRadius:"50%",animation:"spin 25s linear infinite reverse",zIndex:0}}),e.jsxs("main",{style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"12px 20px",position:"relative",zIndex:1,minHeight:0},children:[e.jsx("div",{className:"cs-logo-wrap",style:{marginBottom:8,animation:"floatLogo 3.2s ease-in-out infinite"},children:e.jsx("img",{src:"web-assets/img/logo.png",alt:"Yes Future logo",style:{height:"clamp(100px, 8vh, 80px)",filter:"drop-shadow(0 0 18px rgba(230, 178, 60, 0.35))"}})}),e.jsx("h1",{className:"cs-h1",style:{fontSize:"clamp(22px, 4vw, 44px)",letterSpacing:3,background:`linear-gradient(90deg, ${g}, ${t})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent",marginBottom:6},children:"SOMETHING BIG IS LAUNCHING"}),e.jsx("p",{className:"cs-sub",style:{color:"#b7c3d9",fontSize:"clamp(12px, 1.6vw, 16px)",maxWidth:480,marginBottom:20,lineHeight:1.4},children:"Yes Future is building the next move. The site is almost ready — count down with us."}),e.jsx("div",{className:"cs-countdown",style:{display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center",marginBottom:22},children:a.launched?e.jsxs("div",{className:"cs-unit",style:r,children:[e.jsx("div",{className:"cs-num",style:l(t),children:"🎉"}),e.jsx("div",{className:"cs-label",style:c,children:"Launched"})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"cs-unit",style:r,children:[e.jsx("div",{className:"cs-num",style:l(t),children:d(a.days)}),e.jsx("div",{className:"cs-label",style:c,children:"Days"})]}),e.jsxs("div",{className:"cs-unit",style:r,children:[e.jsx("div",{className:"cs-num",style:l(t),children:d(a.hours)}),e.jsx("div",{className:"cs-label",style:c,children:"Hours"})]}),e.jsxs("div",{className:"cs-unit",style:r,children:[e.jsx("div",{className:"cs-num",style:l(t),children:d(a.minutes)}),e.jsx("div",{className:"cs-label",style:c,children:"Minutes"})]}),e.jsxs("div",{className:"cs-unit",style:r,children:[e.jsx("div",{className:"cs-num",style:l(t),children:d(a.seconds)}),e.jsx("div",{className:"cs-label",style:c,children:"Seconds"})]})]})})]}),e.jsx("footer",{style:{textAlign:"center",fontSize:11,color:"#5c6b85",padding:8,position:"relative",zIndex:1,flexShrink:0},children:"© 2026 Yes Future. All rights reserved."})]})}const r={background:"rgba(255, 255, 255, 0.04)",border:"1px solid rgba(230, 178, 60, 0.25)",borderRadius:12,padding:"12px 18px",minWidth:80,backdropFilter:"blur(6px)",boxShadow:"0 0 20px rgba(30, 155, 224, 0.08)"},l=i=>({fontSize:"clamp(22px, 3.5vw, 34px)",fontWeight:700,color:i,fontVariantNumeric:"tabular-nums"}),c={fontSize:12,letterSpacing:2,color:"#8fa3c0",textTransform:"uppercase",marginTop:4},k=()=>e.jsx(j,{});export{k as component};
