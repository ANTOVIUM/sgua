"use client";
import { useEffect, useRef } from "react";

/** Only the hovered surface owns a RAF; pointer movement never updates React. */
export function useSpatialTilt<T extends HTMLElement>(strength = 5.5, lift = 12) {
 const ref = useRef<T>(null);
 useEffect(() => {
  const element = ref.current;
  if (!element) return;
  const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0, lastTime = 0, inside = false;
  let bounds = {left:0,top:0,width:1,height:1};
  const target = {x:0,y:0,z:0}, current = {x:0,y:0,z:0};
  const allowed = () => pointer.matches && !reduced.matches;
  const apply = () => {
   element.style.setProperty("--tilt-x", `${current.x.toFixed(3)}deg`);
   element.style.setProperty("--tilt-y", `${current.y.toFixed(3)}deg`);
   element.style.setProperty("--lift", `${current.z.toFixed(3)}px`);
   element.style.setProperty("--parallax-x", `${(current.y*.28).toFixed(3)}px`);
   element.style.setProperty("--parallax-y", `${(-current.x*.28).toFixed(3)}px`);
  };
  const animate = (time: number) => {
   const elapsed = lastTime ? Math.min(time-lastTime,40) : 16.7;
   lastTime = time;
   const ease = 1-Math.pow(.84, elapsed/16.7);
   current.x += (target.x-current.x)*ease;
   current.y += (target.y-current.y)*ease;
   current.z += (target.z-current.z)*ease;
   apply();
   if (Math.abs(target.x-current.x)+Math.abs(target.y-current.y)+Math.abs(target.z-current.z) > .015) {
    frame = requestAnimationFrame(animate);
   } else {
    current.x=target.x; current.y=target.y; current.z=target.z; apply();
    frame=0; lastTime=0;
    if (!inside) element.style.willChange="auto";
   }
  };
  const start = () => {if(!frame) frame=requestAnimationFrame(animate);};
  const enter = (event: PointerEvent) => {
   if(event.pointerType!=="mouse" || !allowed()) return;
   inside=true; bounds=element.getBoundingClientRect();
   element.dataset.tilting="true"; element.style.willChange="transform";
   target.z=lift; start();
  };
  const move = (event: PointerEvent) => {
   if(!inside || !allowed()) return;
   const x=Math.max(-1,Math.min(1,(event.clientX-bounds.left)/bounds.width*2-1));
   const y=Math.max(-1,Math.min(1,(event.clientY-bounds.top)/bounds.height*2-1));
   target.x=-y*strength; target.y=x*strength;
   element.style.setProperty("--light-x",`${((x+1)*50).toFixed(1)}%`);
   element.style.setProperty("--light-y",`${((y+1)*50).toFixed(1)}%`);
   start();
  };
  const leave = () => {
   inside=false; delete element.dataset.tilting;
   target.x=target.y=target.z=0;
   if(allowed()) start(); else reset();
  };
  const reset = () => {
   cancelAnimationFrame(frame);frame=0;lastTime=0;inside=false;
   target.x=target.y=target.z=current.x=current.y=current.z=0;
   delete element.dataset.tilting;element.style.willChange="auto";apply();
  };
  const mediaChanged=()=>reset();
  element.addEventListener("pointerenter",enter);
  element.addEventListener("pointermove",move);
  element.addEventListener("pointerleave",leave);
  element.addEventListener("pointercancel",leave);
  pointer.addEventListener("change",mediaChanged);reduced.addEventListener("change",mediaChanged);
  return () => {
   reset();element.removeEventListener("pointerenter",enter);
   element.removeEventListener("pointermove",move);
   element.removeEventListener("pointerleave",leave);
   element.removeEventListener("pointercancel",leave);
   pointer.removeEventListener("change",mediaChanged);reduced.removeEventListener("change",mediaChanged);
  };
 },[strength,lift]);
 return ref;
}
