"use client";
import Image from "next/image";
import {useState} from "react";
export function ArticleImage({src,alt,priority=false,sizes="100vw"}:{src:string;alt:string;priority?:boolean;sizes?:string}){const[failed,setFailed]=useState(false);if(failed)return <div className="article-image-fallback" role="img" aria-label={alt}><span>INSEPTI</span><b>VEILLE IA</b></div>;return <Image src={src} alt={alt} fill priority={priority} sizes={sizes} onError={()=>setFailed(true)}/>}
