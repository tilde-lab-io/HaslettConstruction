!function(){let e=(new Date).getFullYear();document.getElementById("year").innerHTML=e.toString(),function(){var e=function(e){var n;this.element=e,this.delta=[!1,!1],this.dragging=!1,this.intervalId=!1,(n=this).element.addEventListener("mousedown",t.bind(n)),n.element.addEventListener("touchstart",t.bind(n),{passive:!0})};function t(e){switch(e.type){case"mousedown":case"touchstart":!function(e,n){e.dragging=!0,function(e){e.element.addEventListener("mousemove",t.bind(e)),e.element.addEventListener("touchmove",t.bind(e),{passive:!0}),e.element.addEventListener("mouseup",t.bind(e)),e.element.addEventListener("mouseleave",t.bind(e)),e.element.addEventListener("touchend",t.bind(e))}(e),e.delta=[parseInt(i(n).clientX),parseInt(i(n).clientY)],s(e,"dragStart",e.delta,n.target)}(this,e);break;case"mousemove":case"touchmove":!function(e,t){if(!e.dragging)return;window.requestAnimationFrame?e.intervalId=window.requestAnimationFrame(n.bind(e,t)):e.intervalId=setTimeout((function(){n.bind(e,t)}),250)}(this,e);break;case"mouseup":case"mouseleave":case"touchend":!function(e,n){!function(e){e.intervalId&&(window.requestAnimationFrame?window.cancelAnimationFrame(e.intervalId):clearInterval(e.intervalId),e.intervalId=!1),e.element.removeEventListener("mousemove",t.bind(e)),e.element.removeEventListener("touchmove",t.bind(e)),e.element.removeEventListener("mouseup",t.bind(e)),e.element.removeEventListener("mouseleave",t.bind(e)),e.element.removeEventListener("touchend",t.bind(e))}(e);var l=parseInt(i(n).clientX),a=parseInt(i(n).clientY);if(e.delta&&(e.delta[0]||0===e.delta[0])){var r=o(l-e.delta[0]);Math.abs(l-e.delta[0])>30&&s(e,r<0?"swipeLeft":"swipeRight",[l,a]),e.delta[0]=!1}if(e.delta&&(e.delta[1]||0===e.delta[1])){var d=o(a-e.delta[1]);Math.abs(a-e.delta[1])>30&&s(e,d<0?"swipeUp":"swipeDown",[l,a]),e.delta[1]=!1}s(e,"dragEnd",[l,a]),e.dragging=!1}(this,e)}}function n(e){s(this,"dragging",[parseInt(i(e).clientX),parseInt(i(e).clientY)])}function i(e){return e.changedTouches?e.changedTouches[0]:e}function s(e,t,n,i){var s=!1;i&&(s=i);var o=new CustomEvent(t,{detail:{x:n[0],y:n[1],origin:s}});e.element.dispatchEvent(o)}function o(e){return Math.sign?Math.sign(e):(e>0)-(e<0)||+e}window.SwipeContent=e;var l=document.getElementsByClassName("js-swipe-content");if(l.length>0)for(var a=0;a<l.length;a++)!function(t){new e(l[t])}(a)}(),function(){var e=function(e){this.element=e,this.beforeImg=this.element.getElementsByClassName("js-compare-slider__img--before")[0],this.handle=this.element.getElementsByClassName("js-compare-slider__handle")[0],this.keyboardHandle=this.element.getElementsByClassName("js-compare-slider__input-handle")[0],this.captions=this.element.getElementsByClassName("js-compare-slider__caption"),this.dragStart=!1,this.animating=!1,this.leftPosition=50,this.sliderWidth=t(this),function(e){if(d)e.element.classList.add("compare-slider--reduced-motion","compare-slider--in-viewport");else if(r){new IntersectionObserver(o.bind(e),{threshold:[0,.3]}).observe(e.element),n(e)}else e.element.classList.add("compare-slider--in-viewport"),n(e);new SwipeContent(e.element),e.element.addEventListener("dragStart",(function(t){t.detail.origin.closest(".js-compare-slider__handle")&&(e.element.classList.add("compare-slider--is-dragging"),e.dragStart||(e.dragStart=t.detail.x,function(e){document.addEventListener("click",(function t(n){document.removeEventListener("click",t),e.element.classList.remove("compare-slider--is-dragging"),l(e,n.detail.x-e.dragStart),e.dragStart=!1}))}(e)))})),e.element.addEventListener("mousemove",(function(t){i(e,t)})),e.element.addEventListener("touchmove",(function(t){i(e,t)})),e.element.addEventListener("mouseleave",(function(t){s(e,t)})),e.element.addEventListener("touchend",(function(t){s(e,t)})),window.addEventListener("resize",(function(){e.sliderWidth=t(e)})),e.keyboardHandle.addEventListener("change",(function(t){e.leftPosition=Number(e.keyboardHandle.value),l(e,0)}))}(this)};function t(e){return e.element.offsetWidth}function n(e){e.beforeImg.addEventListener("animationend",(function t(){e.beforeImg.removeEventListener("animationend",t),e.beforeImg.style.animation="none"}))}function i(e,t){if(e.dragStart){var n=t.pageX||t.touches[0].pageX;e.animating||Math.abs(n-e.dragStart)<5||(e.animating=!0,l(e,n-e.dragStart),e.dragStart=n)}}function s(e,t){e.dragStart&&(t.pageX<e.element.offsetLeft&&(e.leftPosition=0,l(e,0)),t.pageX>e.element.offsetLeft+e.element.offsetWidth&&(e.leftPosition=100,l(e,0)))}function o(e,t){e[0].intersectionRatio.toFixed(1)>0&&(this.element.classList.add("compare-slider--in-viewport"),t.unobserve(this.element))}function l(e,t){var n=100*t/e.sliderWidth;isNaN(n)||(e.leftPosition=Number((e.leftPosition+n).toFixed(2)),e.leftPosition<0&&(e.leftPosition=0),e.leftPosition>100&&(e.leftPosition=100),e.keyboardHandle.value=e.leftPosition,e.handle.style.left=e.leftPosition+"%",e.beforeImg.style.width=e.leftPosition+"%",function(e){for(var t=0;t<e.captions.length;t++){var n=0==t?e.captions[t].offsetLeft-e.beforeImg.offsetLeft-e.beforeImg.offsetWidth:e.beforeImg.offsetLeft+e.beforeImg.offsetWidth-e.captions[t].offsetLeft-e.captions[t].offsetWidth;e.captions[t].classList.toggle("compare-slider__caption--hide",n<10)}}(e),e.animating=!1)}window.ComparisonSlider=e;var a=document.getElementsByClassName("js-compare-slider"),r="IntersectionObserver"in window&&"IntersectionObserverEntry"in window&&"intersectionRatio"in window.IntersectionObserverEntry.prototype,d=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(a.length>0)for(var c=0;c<a.length;c++)!function(t){new e(a[t])}(c)}(),function(){var e=function(e){this.element=e,this.triggers=document.querySelectorAll('[aria-controls="'+this.element.getAttribute("id")+'"]'),this.firstFocusable=null,this.lastFocusable=null,this.moveFocusEl=null,this.modalFocus=this.element.getAttribute("data-modal-first-focus")?this.element.querySelector(this.element.getAttribute("data-modal-first-focus")):null,this.selectedTrigger=null,this.preventScrollEl=this.getPreventScrollEl(),this.showClass="modal--is-visible",this.initModal()};function t(e){return e.offsetWidth||e.offsetHeight||e.getClientRects().length}e.prototype.getPreventScrollEl=function(){var e=!1,t=this.element.getAttribute("data-modal-prevent-scroll");return t&&(e=document.querySelector(t)),e},e.prototype.initModal=function(){var e=this;if(this.triggers)for(var t=0;t<this.triggers.length;t++)this.triggers[t].addEventListener("click",(function(t){t.preventDefault(),e.element.classList.contains(e.showClass)?e.closeModal():(e.selectedTrigger=t.currentTarget,e.showModal(),e.initModalEvents())}));this.element.addEventListener("openModal",(function(t){t.detail&&(e.selectedTrigger=t.detail),e.showModal(),e.initModalEvents()})),this.element.addEventListener("closeModal",(function(t){t.detail&&(e.selectedTrigger=t.detail),e.closeModal()})),this.element.classList.contains(this.showClass)&&this.initModalEvents()},e.prototype.showModal=function(){var e=this;this.element.classList.add(this.showClass),this.getFocusableElements(),this.moveFocusEl&&(this.moveFocusEl.focus(),this.element.addEventListener("transitionend",(function t(n){e.moveFocusEl.focus(),e.element.removeEventListener("transitionend",t)}))),this.emitModalEvents("modalIsOpen"),this.preventScrollEl&&(this.preventScrollEl.style.overflow="hidden")},e.prototype.closeModal=function(){this.element.classList.contains(this.showClass)&&(this.element.classList.remove(this.showClass),this.firstFocusable=null,this.lastFocusable=null,this.moveFocusEl=null,this.selectedTrigger&&this.selectedTrigger.focus(),this.cancelModalEvents(),this.emitModalEvents("modalIsClose"),this.preventScrollEl&&(this.preventScrollEl.style.overflow=""))},e.prototype.initModalEvents=function(){this.element.addEventListener("keydown",this),this.element.addEventListener("click",this)},e.prototype.cancelModalEvents=function(){this.element.removeEventListener("keydown",this),this.element.removeEventListener("click",this)},e.prototype.handleEvent=function(e){switch(e.type){case"click":this.initClick(e);case"keydown":this.initKeyDown(e)}},e.prototype.initKeyDown=function(e){e.keyCode&&9==e.keyCode||e.key&&"Tab"==e.key?this.trapFocus(e):(e.keyCode&&13==e.keyCode||e.key&&"Enter"==e.key)&&e.target.closest(".js-modal__close")&&(e.preventDefault(),this.closeModal())},e.prototype.initClick=function(e){(e.target.closest(".js-modal__close")||e.target.classList.contains("js-modal"))&&(e.preventDefault(),this.closeModal())},e.prototype.trapFocus=function(e){this.firstFocusable===document.activeElement&&e.shiftKey&&(e.preventDefault(),this.lastFocusable.focus()),this.lastFocusable!==document.activeElement||e.shiftKey||(e.preventDefault(),this.firstFocusable.focus())},e.prototype.getFocusableElements=function(){var e=this.element.querySelectorAll(i);this.getFirstVisible(e),this.getLastVisible(e),this.getFirstFocusable()},e.prototype.getFirstVisible=function(e){for(var n=0;n<e.length;n++)if(t(e[n])){this.firstFocusable=e[n];break}},e.prototype.getLastVisible=function(e){for(var n=e.length-1;n>=0;n--)if(t(e[n])){this.lastFocusable=e[n];break}},e.prototype.getFirstFocusable=function(){if(this.modalFocus&&Element.prototype.matches)if(this.modalFocus.matches(i))this.moveFocusEl=this.modalFocus;else{this.moveFocusEl=!1;for(var e=this.modalFocus.querySelectorAll(i),n=0;n<e.length;n++)if(t(e[n])){this.moveFocusEl=e[n];break}this.moveFocusEl||(this.moveFocusEl=this.firstFocusable)}else this.moveFocusEl=this.firstFocusable},e.prototype.emitModalEvents=function(e){var t=new CustomEvent(e,{detail:this.selectedTrigger});this.element.dispatchEvent(t)},window.Modal=e;var n=document.getElementsByClassName("js-modal"),i='[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';if(n.length>0){for(var s=[],o=0;o<n.length;o++)!function(t){s.push(new e(n[t]))}(o);window.addEventListener("keydown",(function(e){if(e.keyCode&&27==e.keyCode||e.key&&"escape"==e.key.toLowerCase())for(var t=0;t<s.length;t++)!function(e){s[e].closeModal()}(t)}))}}()}();
//# sourceMappingURL=script.js.map