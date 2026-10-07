"use client";
import {useEffect,useRef,useState} from "react";
import {Collapsible,CollapsibleTrigger,CollapsibleContent} from "@/components/ui/collapsible";
import {Progress} from "@/components/ui/progress";
import {directions,type Direction,type Metric} from "./report-data";
import {useSpatialTilt} from "./use-spatial-tilt";

function DirectionPanel({direction:d,selected,onSelect}:{direction:Direction;selected:string|null;onSelect:(id:string)=>void}){
 const ref=useSpatialTilt<HTMLButtonElement>();
 return <div className={`direction-slot slot-${d.id} ${selected===d.id?"selected":selected?"receded":""}`}>
  <button ref={ref} type="button" className={`direction-panel spatial ${d.tone}`} aria-label={d.title} aria-expanded={selected===d.id} aria-controls="direction-detail" onClick={()=>onSelect(d.id)}>
   <span className="panel-head"><span>{d.id}</span><span>{selected===d.id?"Открыто":"Направление"}</span></span>
   <h2>{d.title}</h2><span className="key-value">{d.value}<small>{d.unit}</small></span>
   <span className="value-label">{d.label}</span><span className="panel-bottom">{d.meta}</span>
  </button>
 </div>
}
function valueText(value:string|null){return value===null||value==="-"?"Нет данных":value}
function Disclosure({title,children,className=""}:{title:string;children:React.ReactNode;className?:string}){
 const [open,setOpen]=useState(false);
 return <Collapsible open={open} onOpenChange={setOpen} className={`disclosure ${className}`}>
  <CollapsibleTrigger className="disclosure-button"><span>{title}</span><span className="disclosure-sign" aria-hidden="true">{open?"−":"+"}</span></CollapsibleTrigger>
  <CollapsibleContent forceMount className="physical-unfold" aria-hidden={!open} inert={!open}><div className="unfold-inner"><div className="disclosure-content">{children}</div></div></CollapsibleContent>
 </Collapsible>
}
function MetricCard({metric:m,directionId,child=false,index=0}:{metric:Metric;directionId:string;child?:boolean;index?:number}){
 const [commentOpen,setCommentOpen]=useState(false);
 const ref=useSpatialTilt<HTMLElement>(child?1.2:2.1,child?3:5);
 const percentage=m.completion===null?null:parseFloat(m.completion.replace(",","."));
 const titleId=`metric-${directionId}-${m.id}`;
 return <Collapsible open={commentOpen} onOpenChange={setCommentOpen} asChild>
  <article ref={ref} className={`metric-card spatial ${child?"sub-metric":""} ${commentOpen?"comment-open":""} ${index%3===1?"offset":""}`} aria-labelledby={titleId} data-metric-id={`${directionId}.${m.id}`}>
   <div className="metric-main">
    <div className="metric-heading"><span className="metric-number">{m.id.padStart(2,"0")}</span><div>
     {m.fullTitle&&m.fullTitle!==m.title?<details className="metric-definition"><summary><h3 id={titleId}>{m.title}</h3><span aria-hidden="true" className="definition-sign">+</span></summary><p>{m.fullTitle}</p></details>:<h3 id={titleId}>{m.title}</h3>}
     {m.state!=="measured"&&<span className="data-status">{m.state==="annual"?"По итогам года":"Нет фактических данных"}</span>}
    </div></div>
    <div className={`plan-fact ${m.plan&&m.plan.length>18?"long-plan":""} ${m.state!=="measured"?"awaiting":""}`}>
     <div className="numeric-caption"><span>План → Факт</span>{m.unit&&<span>{m.unit}</span>}</div>
     <div className="value-pair"><span className={m.plan===null||m.plan==="-"?"no-value":""}>{valueText(m.plan)}</span><span className="pair-arrow" aria-hidden="true">→</span><strong className={m.state!=="measured"?"no-value":""}>{valueText(m.fact)}</strong></div>
    </div>
    <div className="completion"><div className="completion-heading"><strong className={percentage===null?"no-percentage":""}>{m.completion??"Н/Р"}</strong><span>Выполнение</span></div>
     {percentage!==null?<Progress className="metric-progress" value={Math.min(percentage,100)} aria-label={`Выполнение: ${m.completion}`} aria-valuetext={m.completion??undefined}/>:<span className="pending-line"/>}
    </div>
   </div>
   <div className="metric-footer"><div className="metric-meta"><span>Вес <strong>{m.weight??"Нет данных"}</strong></span><span>Оценка <strong>{m.score??"Нет данных"}</strong></span></div>
    {m.comment&&<CollapsibleTrigger className="comment-button"><span>{commentOpen?"Закрыть комментарий":"Комментарий"}</span><span aria-hidden="true">{commentOpen?"−":"+"}</span></CollapsibleTrigger>}
   </div>
   {m.comment&&<CollapsibleContent forceMount className="physical-unfold comment-layer" aria-hidden={!commentOpen} inert={!commentOpen}><div className="unfold-inner"><div className="comment-paper"><span className="comment-caption">КОММЕНТАРИЙ К ПОКАЗАТЕЛЮ</span><p>{m.comment}</p></div></div></CollapsibleContent>}
   {m.children&&<Disclosure title="Состав показателя" className="submetrics-disclosure"><div className="submetrics">{m.children.map((metric,i)=><MetricCard key={metric.id} metric={metric} directionId={directionId} child index={i}/>)}</div></Disclosure>}
  </article>
 </Collapsible>
}
export default function Home(){
 const [selected,setSelected]=useState<string|null>(null);
 const detailRef=useRef<HTMLElement>(null);
 const overviewRef=useRef<HTMLElement>(null);
 const direction=directions.find(d=>d.id===selected);
 useEffect(()=>{
  if(!selected)return;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timer=setTimeout(()=>{detailRef.current?.scrollIntoView({behavior:reduced?"instant":"smooth",block:"start"});detailRef.current?.focus({preventScroll:true});},reduced?0:260);
  return ()=>clearTimeout(timer);
 },[selected]);
 function back(){const previous=selected;setSelected(null);const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;overviewRef.current?.scrollIntoView({behavior:reduced?"instant":"smooth",block:"start"});requestAnimationFrame(()=>{document.querySelector<HTMLButtonElement>(`.slot-${previous} button`)?.focus({preventScroll:true})})}
 useEffect(()=>{function escape(e:KeyboardEvent){if(e.key==="Escape"&&selected)back()}window.addEventListener("keydown",escape);return()=>window.removeEventListener("keydown",escape)},[selected]);
 return <main className="report-app">
  <header className="masthead"><button className="identity" onClick={()=>{if(selected)back()}} aria-label="СГЮА - все направления"><img src="./sgua-95.svg" alt="СГЮА, 95 лет" width="65" height="65"/><span>САРАТОВСКАЯ ГОСУДАРСТВЕННАЯ<br/>ЮРИДИЧЕСКАЯ АКАДЕМИЯ</span></button><div className="report-stamp"><span>Программа развития 2023-2032</span><strong>Контрольный срез · 01.09.2026</strong></div></header>
  <section className="overview" ref={overviewRef} aria-labelledby="report-title">
   <div className="intro"><div><span className="eyebrow">РЕАЛИЗАЦИЯ ПРОГРАММЫ РАЗВИТИЯ</span><h1 id="report-title">Кафедра теории<br/>государства и права</h1></div><div className="intro-side"><span className="year">2026</span><span>Промежуточный отчет</span></div></div>
   <div className={`stage ${selected?"has-selection":""}`} aria-label="Шесть направлений Программы развития">{directions.map(d=><DirectionPanel key={d.id} direction={d} selected={selected} onSelect={setSelected}/>)}</div>
   <div className="overview-foot"><span>22,5 ставки на 01.01.2026</span><span>Итоговая оценка: Н/Р · часть показателей формируется по итогам года</span></div>
  </section>
  {direction&&<section ref={detailRef} key={direction.id} id="direction-detail" className="direction-detail" tabIndex={-1} aria-labelledby="detail-title">
   <div className="detail-toolbar"><button className="back-button" onClick={back}>Все направления</button><a className="source-link" href={`./report-2026.pdf#page=${direction.sourcePages.split("-")[0]}`} target="_blank" rel="noopener noreferrer">PDF-отчет · стр. {direction.sourcePages}</a></div>
   <div className="detail-header"><div><span className="eyebrow">НАПРАВЛЕНИЕ {direction.id}</span><h2 id="detail-title">{direction.title}</h2>{direction.fullTitle!==direction.title&&<p className="policy-name">{direction.fullTitle}</p>}</div><div className="direction-results"><div><strong>{direction.total}</strong><span>Выполнение направления</span></div><div><strong>{direction.contribution}</strong><span>Вклад в Программу развития</span></div></div></div>
   {direction.total==="Н/Р"&&<p className="direction-note">Расчет по направлению не выполнен на промежуточную контрольную дату. Доступные значения показателей приведены ниже.</p>}
   <div className="metric-flow">{direction.metrics.map((metric,i)=><MetricCard key={`${direction.id}-${metric.id}`} metric={metric} directionId={direction.id} index={i}/>)}</div>
   <div className="detail-foot"><span>Процент выполнения и оценка приведены по PDF-отчету. Н/Р - расчет не выполнен.</span><button className="back-button" onClick={back}>Все направления</button></div>
  </section>}
  <footer className="source-footer"><p>Факт приведен по последним представленным сводным данным, преимущественно на 01.09.2026. По отдельным показателям промежуточное значение не определяется ввиду особенностей их формирования, методики и периодичности расчета.</p><a href="./report-2026.pdf" target="_blank" rel="noopener noreferrer">Исходный отчет</a></footer>
 </main>
}
