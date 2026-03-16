class ImageModal{constructor(t=".project-gallery img, .narrative-visual img, .project-hero-bg img"){if(this.images=Array.from(document.querySelectorAll(t)),this.currentIndex=0,this.isOpen=!1,this.images.length===0){console.warn("ImageModal: No images found for selector:",t);return}this.init()}init(){this.createModalHTML(),this.addEventListeners()}createModalHTML(){if(document.querySelector(".image-modal-overlay"))return;document.body.insertAdjacentHTML("beforeend",`
            <div class="image-modal-overlay" id="image-modal" aria-hidden="true" role="dialog">
                <button class="image-modal-close" aria-label="Close modal">
                    <span class="material-symbols-outlined">close</span>
                </button>
                
                <button class="image-modal-nav image-modal-prev" aria-label="Previous image">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                    </svg>
                </button>
                
                <div class="image-modal-content">
                    <img src="" alt="" class="image-modal-img" id="modal-image">
                </div>
                
                <button class="image-modal-nav image-modal-next" aria-label="Next image">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                    </svg>
                </button>
            </div>
        `),this.modal=document.getElementById("image-modal"),this.modalImg=document.getElementById("modal-image"),this.closeBtn=this.modal.querySelector(".image-modal-close"),this.prevBtn=this.modal.querySelector(".image-modal-prev"),this.nextBtn=this.modal.querySelector(".image-modal-next")}addEventListeners(){this.images.forEach((e,a)=>{e.style.cursor="pointer",e.addEventListener("click",i=>{i.preventDefault(),this.openModal(a)})}),this.closeBtn.addEventListener("click",()=>this.closeModal()),this.prevBtn.addEventListener("click",e=>{e.stopPropagation(),this.prevImage()}),this.nextBtn.addEventListener("click",e=>{e.stopPropagation(),this.nextImage()}),this.modal.addEventListener("click",e=>{(e.target===this.modal||e.target.classList.contains("image-modal-content"))&&this.closeModal()}),document.addEventListener("keydown",e=>{this.isOpen&&(e.key==="Escape"&&this.closeModal(),e.key==="ArrowLeft"&&this.prevImage(),e.key==="ArrowRight"&&this.nextImage())});let t=0,s=0;this.modal.addEventListener("touchstart",e=>{t=e.changedTouches[0].screenX},{passive:!0}),this.modal.addEventListener("touchend",e=>{s=e.changedTouches[0].screenX,this.handleSwipe()},{passive:!0}),this.handleSwipe=()=>{s<t-50&&this.nextImage(),s>t+50&&this.prevImage()}}openModal(t){this.currentIndex=t,this.updateModalContent(),this.modal.classList.add("open"),this.modal.setAttribute("aria-hidden","false"),document.body.style.overflow="hidden",this.isOpen=!0}closeModal(){this.modal.classList.remove("open"),this.modal.setAttribute("aria-hidden","true"),document.body.style.overflow="",this.isOpen=!1,setTimeout(()=>{this.isOpen||(this.modalImg.src="")},300)}updateModalContent(){const t=this.images[this.currentIndex];this.modalImg.src=t.src,this.modalImg.alt=t.alt,this.preloadImage(this.currentIndex+1),this.preloadImage(this.currentIndex-1)}nextImage(){this.currentIndex=(this.currentIndex+1)%this.images.length,this.updateModalContent()}prevImage(){this.currentIndex=(this.currentIndex-1+this.images.length)%this.images.length,this.updateModalContent()}preloadImage(t){const s=(t+this.images.length)%this.images.length,e=new Image;e.src=this.images[s].src}}document.addEventListener("DOMContentLoaded",()=>{window.ImageModal=ImageModal});
