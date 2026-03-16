document.addEventListener("DOMContentLoaded",()=>{const o=document.getElementById("footer-posts-container");if(!o)return;const p="https://www.nodeflow.site/webhook-test/get-ig-posts",u="https://www.instagram.com/dbda_arch",l="footer_posts_cache",h=36e5,g=()=>{const a=localStorage.getItem("dbda_consent");if(!a)return null;try{return JSON.parse(a)}catch{return null}},m=()=>{const a=localStorage.getItem(l);if(!a)return null;try{const{data:t,timestamp:e}=JSON.parse(a);return Date.now()-e>h?(localStorage.removeItem(l),null):t}catch{return null}},f=a=>{const t={data:a,timestamp:Date.now()};localStorage.setItem(l,JSON.stringify(t))},i=()=>{o.innerHTML=`
            <div class="mt-6 flex justify-center md:justify-start">
                <a href="${u}" target="_blank" class="inline-flex items-center group text-xs font-bold tracking-widest uppercase">
                    <div class="relative flex items-center">
                        <div
                            class="relative w-4 h-4 border border-primary/10 dark:border-white/10 group-hover:border-transparent transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform">
                            <!-- Central Axis Pillar -->
                            <span
                                class="absolute left-1/2 top-0 -translate-x-1/2 w-[1px] h-full bg-primary dark:bg-white opacity-0 transition-all duration-1000 group-hover:opacity-100 group-hover:h-12 group-hover:-top-4 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-[height,top]"></span>

                            <!-- Expansion Line -->
                            <span
                                class="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-primary dark:bg-white transition-all duration-1000 delay-400 group-hover:w-12 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-[width]"></span>
                        </div>
                        <span
                            class="ml-4 text-primary dark:text-white transition-all duration-1000 group-hover:-translate-x-2 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform">
                            Sledujte n\xE1s na Instagramu
                        </span>
                    </div>
                </a>
            </div>
        `},v=async()=>{const a=g();if(!a||!a.functional){i();return}const t=m();if(t){c(t);return}try{const e=await fetch(p);if(!e.ok)throw new Error("Network response was not ok");const r=await e.json();let s=[];if(Array.isArray(r)?s=r:r&&Array.isArray(r.data)&&(s=r.data),s.length===0){i();return}f(s),c(s)}catch(e){console.error("Error fetching footer posts:",e),i()}},c=a=>{o.innerHTML="",o.className="mt-6 relative h-20 overflow-hidden";const t=[];let e=0;a.slice(0,6).forEach((r,s)=>{const w=r.caption||"",d=r.media_url||"",y=r.permalink||"#",n=document.createElement("a");n.href=y,n.target="_blank",n.className=`absolute inset-0 flex gap-3 group items-center justify-center md:justify-start transition-opacity duration-1000 ease-in-out ${s===0?"opacity-100 z-10":"opacity-0 z-0"}`,n.innerHTML=`
                ${d?`
                <div class="w-16 h-16 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img src="${d}" alt="Instagram post" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                </div>
                `:""}
                <div class="flex-1 min-w-0">
                    <p class="text-[11px] text-muted-light dark:text-muted-dark line-clamp-3 leading-snug group-hover:text-primary dark:group-hover:text-white transition-colors">
                        ${w}
                    </p>
                </div>
            `,o.appendChild(n),t.push(n)}),t.length>1&&setInterval(()=>{t[e].classList.remove("opacity-100","z-10"),t[e].classList.add("opacity-0","z-0"),e=(e+1)%t.length,t[e].classList.remove("opacity-0","z-0"),t[e].classList.add("opacity-100","z-10")},5e3)};i()});
