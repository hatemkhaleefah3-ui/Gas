import { navigate } from '/client/router.js';
import { patch } from '/client/api.js';
import { state } from '/client/state.js';
import { prismIcon } from '/client/prism-icons.js';

let root;
let renderObserver;
let modalObserver;
let languageObserver;
let currentLanguage;

const isArabic = () => state.language === 'ar';
const tx = (en, ar) => isArabic() ? ar : en;
const esc = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function toast(message) {
  const node=document.querySelector('#toast');
  if(!node)return;
  node.textContent=message;
  node.classList.add('show');
  setTimeout(()=>node.classList.remove('show'),2200);
}

function openQuickAction(action) {
  const fab=document.querySelector('#prismFab');
  const actionButton=document.querySelector(`#prismQuick [data-prism-action="${action}"]`);
  if(!fab||!actionButton)return;
  fab.click();
  requestAnimationFrame(()=>actionButton.click());
}

function closeBridgeModal() {
  const layer=document.querySelector('#prismModal');
  if(!layer)return;
  layer.classList.remove('open');
  layer.setAttribute('aria-hidden','true');
  layer.innerHTML='';
  document.body.classList.remove('prism-overlay-open');
}

function modal(title,lead,fields,submitLabel,onSubmit) {
  const layer=document.querySelector('#prismModal');
  if(!layer)return;
  layer.innerHTML=`<button class="prism-modal-backdrop" data-bridge-close></button><section class="prism-modal-card" role="dialog" aria-modal="true"><header><div><small>${esc(tx('ACCOUNT ACTION','إجراء الحساب'))}</small><h2>${esc(title)}</h2><p>${esc(lead)}</p></div><button type="button" data-bridge-close>${prismIcon('close')}</button></header><form id="prismBridgeForm">${fields}<div class="prism-form-error" id="prismBridgeError"></div><footer><button type="button" class="button secondary" data-bridge-close>${esc(tx('Cancel','إلغاء'))}</button><button type="submit" class="button">${esc(submitLabel)}</button></footer></form></section>`;
  layer.classList.add('open');
  layer.setAttribute('aria-hidden','false');
  document.body.classList.add('prism-overlay-open');
  layer.querySelectorAll('[data-bridge-close]').forEach(button=>button.addEventListener('click',closeBridgeModal));
  const form=layer.querySelector('#prismBridgeForm');
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const submit=form.querySelector('[type="submit"]');
    const error=form.querySelector('#prismBridgeError');
    submit.disabled=true;submit.classList.add('loading');error.textContent='';
    try{await onSubmit(form);closeBridgeModal();toast(tx('Changes saved.','تم حفظ التغييرات.'));window.dispatchEvent(new PopStateEvent('popstate'));}
    catch(err){error.textContent=err.message||tx('Could not save changes.','تعذر حفظ التغييرات.');submit.disabled=false;submit.classList.remove('loading');}
  });
  requestAnimationFrame(()=>form.querySelector('input,textarea')?.focus());
}

function label(text,control){return `<label><span>${esc(text)}</span>${control}</label>`;}

function openProfileEditor() {
  const user=state.session.user||{};
  modal(
    tx('Edit learning identity','تعديل الهوية التعليمية'),
    tx('Keep your academic profile clear, personal and useful.','حافظ على ملفك الأكاديمي واضحاً وشخصياً ومفيداً.'),
    `${label(tx('Full name','الاسم الكامل'),`<input name="full_name" maxlength="120" required value="${esc(user.full_name||'')}">`)}${label(tx('Bio','نبذة'),'<textarea name="bio" maxlength="500" rows="4"></textarea>')}${label(tx('Learning goal','هدف التعلّم'),'<textarea name="learning_goal" maxlength="500" rows="3"></textarea>')}`,
    tx('Save profile','حفظ الملف'),
    form=>patch('/api/profile',{full_name:form.elements.namedItem('full_name').value.trim(),bio:form.elements.namedItem('bio').value.trim(),learning_goal:form.elements.namedItem('learning_goal').value.trim()})
  );
}

function openPasswordEditor() {
  modal(
    tx('Change password','تغيير كلمة المرور'),
    tx('Your other sessions will be revoked after a successful change.','سيتم إنهاء جلساتك الأخرى بعد نجاح التغيير.'),
    `${label(tx('Current password','كلمة المرور الحالية'),'<input name="current_password" type="password" minlength="8" maxlength="128" required>')}${label(tx('New password','كلمة المرور الجديدة'),'<input name="new_password" type="password" minlength="8" maxlength="128" required>')}${label(tx('Confirm password','تأكيد كلمة المرور'),'<input name="confirm_password" type="password" minlength="8" maxlength="128" required>')}`,
    tx('Update password','تحديث كلمة المرور'),
    form=>{
      const next=form.elements.namedItem('new_password').value;
      if(next!==form.elements.namedItem('confirm_password').value)throw new Error(tx('Passwords do not match.','كلمتا المرور غير متطابقتين.'));
      return patch('/api/account/password',{current_password:form.elements.namedItem('current_password').value,new_password:next});
    }
  );
}

function bindPageActions() {
  if(!root)return;
  const bindings=[['#addSchedule','schedule'],['#newPost','post'],['#newRoom','room']];
  bindings.forEach(([selector,action])=>{
    const button=root.querySelector(selector);
    if(!button||button.dataset.prismBridge)return;
    button.dataset.prismBridge='1';
    button.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();openQuickAction(action);});
  });
  const profile=root.querySelector('#editProfile');
  if(profile&&!profile.dataset.prismBridge){profile.dataset.prismBridge='1';profile.addEventListener('click',event=>{event.preventDefault();openProfileEditor();});}
  const password=root.querySelector('#changePassword');
  if(password&&!password.dataset.prismBridge){password.dataset.prismBridge='1';password.addEventListener('click',event=>{event.preventDefault();openPasswordEditor();});}
}

function shadowNamedFormControls() {
  const form=document.querySelector('#prismModal form');
  if(!form||form.dataset.namedControlsReady)return;
  form.dataset.namedControlsReady='1';
  for(const control of form.elements){
    if(!control.name)continue;
    try{Object.defineProperty(form,control.name,{value:control,configurable:true});}catch{}
  }
}

function bindInjectedLinks() {
  document.addEventListener('click',event=>{
    const link=event.target.closest('.prism-card [data-link],.prism-opportunity-band [data-link]');
    if(!link)return;
    if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    navigate(link.getAttribute('href'));
  });
}

export function initPrismFlowBridge(appRoot) {
  root=appRoot;
  currentLanguage=document.documentElement.lang||state.language;
  renderObserver?.disconnect();
  renderObserver=new MutationObserver(bindPageActions);
  renderObserver.observe(root,{childList:true,subtree:true});
  modalObserver?.disconnect();
  modalObserver=new MutationObserver(shadowNamedFormControls);
  modalObserver.observe(document.body,{childList:true,subtree:true});
  languageObserver?.disconnect();
  languageObserver=new MutationObserver(()=>{
    const next=document.documentElement.lang||state.language;
    if(next!==currentLanguage){currentLanguage=next;setTimeout(()=>location.reload(),80);}
  });
  languageObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});
  bindInjectedLinks();
  bindPageActions();
}
