class ImageModal{constructor(e=".project-gallery img, .narrative-visual img, .project-hero-bg img"){if(this.images=Array.from(document.querySelectorAll(e)),this.currentIndex=0,this.isOpen=!1,this.images.length===0){console.warn("ImageModal: No images found for selector:",e);return}this.init()}init(){this.createModalHTML(),this.addEventListeners()}createModalHTML(){let e=document.querySelector(".image-modal-overlay");e||(document.body.insertAdjacentHTML("beforeend",`
                <div class="image-modal-overlay" id="image-modal" aria-hidden="true" role="dialog">
                    <button class="image-modal-close" aria-label="Close modal">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                    
                    <button class="image-modal-nav image-modal-prev" aria-label="Previous image">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    
                    <div class="image-modal-content">
                        <img src="" alt="" class="image-modal-img" id="modal-image">
                    </div>
                    
                    <button class="image-modal-nav image-modal-next" aria-label="Next image">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            `),e=document.getElementById("image-modal")),this.modal=e,this.modalImg=document.getElementById("modal-image"),this.closeBtn=this.modal.querySelector(".image-modal-close"),this.prevBtn=this.modal.querySelector(".image-modal-prev"),this.nextBtn=this.modal.querySelector(".image-modal-next")}addEventListeners(){this.images.forEach((t,s)=>{t.style.cursor="pointer",t.addEventListener("click",i=>{i.preventDefault(),this.openModal(s)})}),this.closeBtn.addEventListener("click",()=>this.closeModal()),this.prevBtn.addEventListener("click",t=>{t.stopPropagation(),this.prevImage()}),this.nextBtn.addEventListener("click",t=>{t.stopPropagation(),this.nextImage()}),this.modal.addEventListener("click",t=>{(t.target===this.modal||t.target.classList.contains("image-modal-content"))&&this.closeModal()}),document.addEventListener("keydown",t=>{this.isOpen&&(t.key==="Escape"&&this.closeModal(),t.key==="ArrowLeft"&&this.prevImage(),t.key==="ArrowRight"&&this.nextImage())});let e=0,a=0;this.modal.addEventListener("touchstart",t=>{e=t.changedTouches[0].screenX},{passive:!0}),this.modal.addEventListener("touchend",t=>{a=t.changedTouches[0].screenX,this.handleSwipe(e,a)},{passive:!0})}handleSwipe(e,a){a<e-50?this.nextImage():a>e+50&&this.prevImage()}openModal(e){this.currentIndex=e,this.updateModalContent(),this.modal.classList.add("open"),this.modal.setAttribute("aria-hidden","false"),document.body.style.overflow="hidden",this.isOpen=!0}closeModal(){this.modal.classList.remove("open"),this.modal.setAttribute("aria-hidden","true"),document.body.style.overflow="",this.isOpen=!1,setTimeout(()=>{this.isOpen||(this.modalImg.src="")},300)}updateModalContent(){const e=this.images[this.currentIndex];this.modalImg.src=e.src,this.modalImg.alt=e.alt,this.preloadImage(this.currentIndex+1),this.preloadImage(this.currentIndex-1)}nextImage(){this.currentIndex=(this.currentIndex+1)%this.images.length,this.updateModalContent()}prevImage(){this.currentIndex=(this.currentIndex-1+this.images.length)%this.images.length,this.updateModalContent()}preloadImage(e){const a=(e+this.images.length)%this.images.length,t=new Image;t.src=this.images[a].src}}document.addEventListener("DOMContentLoaded",()=>{window.ImageModal=ImageModal});
