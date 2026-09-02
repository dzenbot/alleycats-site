const menuButton=document.querySelector('.menu');
const nav=document.querySelector('header nav');
if(menuButton&&nav){menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',open)})}
const currentPage=window.location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('.original-header nav a[href$=".html"]').forEach(link=>{
  const linkPage=new URL(link.href,window.location.href).pathname.split('/').pop();
  link.classList.toggle('is-current',currentPage!=='index.html'&&linkPage===currentPage);
});
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const reviews=[...document.querySelectorAll('.reviews blockquote')];
let reviewIndex=0;
function showReview(next){if(!reviews.length)return;reviews[reviewIndex].classList.remove('active');reviewIndex=(next+reviews.length)%reviews.length;reviews[reviewIndex].classList.add('active')}
document.querySelector('.review-arrow.next')?.addEventListener('click',()=>showReview(reviewIndex+1));
document.querySelector('.review-arrow.prev')?.addEventListener('click',()=>showReview(reviewIndex-1));

const faqList=document.querySelector('#faq-list');
if(faqList){
  fetch('faq.json')
    .then(response=>{if(!response.ok)throw new Error('FAQ data could not be loaded');return response.json()})
    .then(items=>{
      faqList.textContent='';
      items.forEach((item,index)=>{
        const article=document.createElement('article');
        article.className=`faq-item${index===0?' is-open':''}`;

        const button=document.createElement('button');
        button.className='faq-question';
        button.type='button';
        button.id=`faq-question-${index}`;
        button.setAttribute('aria-expanded',index===0?'true':'false');
        button.setAttribute('aria-controls',`faq-answer-${index}`);

        const label=document.createElement('span');
        label.textContent=item.question;
        const chevron=document.createElement('span');
        chevron.className='faq-chevron';
        chevron.setAttribute('aria-hidden','true');
        button.append(label,chevron);

        const answer=document.createElement('div');
        answer.className='faq-answer';
        answer.id=`faq-answer-${index}`;
        answer.setAttribute('role','region');
        answer.setAttribute('aria-labelledby',button.id);
        const inner=document.createElement('div');
        inner.className='faq-answer-inner';
        const content=document.createElement('div');
        content.className='faq-answer-content';
        item.answer.forEach(text=>{const p=document.createElement('p');p.textContent=text;content.appendChild(p)});
        inner.appendChild(content);answer.appendChild(inner);

        button.addEventListener('click',()=>{
          const open=article.classList.toggle('is-open');
          button.setAttribute('aria-expanded',String(open));
        });
        article.append(button,answer);faqList.appendChild(article);
      });
    })
    .catch(()=>{faqList.innerHTML='<p class="faq-loading">Questions are temporarily unavailable. Please refresh the page.</p>'});
}

const parallaxImages=[...document.querySelectorAll('.original-hero>img,.replica-hero>img')];
if(parallaxImages.length&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  let parallaxFrame;
  const updateParallax=()=>{
    parallaxFrame=undefined;
    parallaxImages.forEach(image=>{
      const hero=image.parentElement;
      const rect=hero.getBoundingClientRect();
      const distance=(window.innerHeight/2)-(rect.top+rect.height/2);
      const offset=Math.max(-45,Math.min(45,distance*.08));
      image.style.setProperty('--parallax-offset',`${offset}px`);
    });
  };
  const requestParallax=()=>{if(!parallaxFrame)parallaxFrame=requestAnimationFrame(updateParallax)};
  updateParallax();
  window.addEventListener('scroll',requestParallax,{passive:true});
  window.addEventListener('resize',requestParallax);
}
