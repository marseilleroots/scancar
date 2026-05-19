/**
 * ScanCar — Intégration CarVertical
 * Appelé après déverrouillage du rapport complet.
 */

window.carvertical = (function () {

    const ENDPOINT = '/.netlify/functions/carvertical';

    // ---- Fetch ----
    async function fetchReport(plate) {
        const clean = plate.replace(/\s/g, '').toUpperCase();
        const resp = await fetch(`${ENDPOINT}?plate=${encodeURIComponent(clean)}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return resp.json();
    }

    // ---- Render ----
    function render(data, container) {
        if (!container) return;

        // Mode "pending" : API pas encore configurée
        if (data.status === 'pending') {
            container.innerHTML = pendingHTML();
            return;
        }

        if (data.error) {
            container.innerHTML = errorHTML(data.error);
            return;
        }

        container.innerHTML = reportHTML(data);
    }

    function statusIcon(ok) {
        return ok
            ? '<span class="cv-badge cv-ok">✓</span>'
            : '<span class="cv-badge cv-warn">⚠</span>';
    }

    function reportHTML(d) {
        const acc   = d.accidents  || {};
        const theft = d.theft      || {};
        const pledge = d.pledge    || {};
        const km    = d.mileage    || {};
        const ct    = d.ct         || {};
        const own   = d.owners     || {};

        const accOk    = (acc.count   || 0) === 0;
        const theftOk  = !theft.stolen;
        const pledgeOk = !pledge.has_pledge;
        const kmOk     = km.is_consistent !== false;

        // Historique km (tableau)
        const kmRows = (km.records || []).map(r =>
            `<tr><td>${fmtDate(r.date)}</td><td>${fmtKm(r.value)}</td><td class="cv-source">${r.source || '—'}</td></tr>`
        ).join('');

        // CT records
        const ctRows = (ct.records || []).map(r =>
            `<tr><td>${fmtDate(r.date)}</td><td class="${r.result === 'FAVORABLE' ? 'cv-ok-text' : 'cv-warn-text'}">${r.result || '—'}</td><td>${fmtKm(r.mileage)}</td></tr>`
        ).join('');

        // Accidents
        const accRows = (acc.records || []).map(r =>
            `<li class="cv-list-item"><span class="cv-warn-text">${fmtDate(r.date)}</span> — ${r.type}${r.severity ? ' (' + r.severity + ')' : ''}</li>`
        ).join('');

        return `
<div class="cv-report">
    <div class="cv-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>Rapport CarVertical officiel</span>
        ${d.vin ? `<span class="cv-vin">VIN : ${d.vin}</span>` : ''}
    </div>

    <!-- Statuts clés -->
    <div class="cv-status-grid">
        <div class="cv-status-item ${accOk ? 'cv-status-ok' : 'cv-status-warn'}">
            ${statusIcon(accOk)}
            <span class="cv-status-label">${accOk ? 'Aucun accident' : acc.count + ' accident(s)'}</span>
        </div>
        <div class="cv-status-item ${theftOk ? 'cv-status-ok' : 'cv-status-warn'}">
            ${statusIcon(theftOk)}
            <span class="cv-status-label">${theftOk ? 'Non volé' : 'Vol signalé'}</span>
        </div>
        <div class="cv-status-item ${pledgeOk ? 'cv-status-ok' : 'cv-status-warn'}">
            ${statusIcon(pledgeOk)}
            <span class="cv-status-label">${pledgeOk ? 'Pas de gage' : 'Gage détecté'}</span>
        </div>
        <div class="cv-status-item ${kmOk ? 'cv-status-ok' : 'cv-status-warn'}">
            ${statusIcon(kmOk)}
            <span class="cv-status-label">${kmOk ? 'Km cohérents' : 'Fraude km possible'}</span>
        </div>
    </div>

    <!-- Kilométrage -->
    ${km.last_known ? `
    <div class="cv-section">
        <h5 class="cv-section-title">Kilométrage vérifié</h5>
        <div class="cv-km-last">${fmtKm(km.last_known)} <span class="cv-km-date">au ${fmtDate(km.last_date)}</span></div>
        ${kmRows ? `<table class="cv-table"><thead><tr><th>Date</th><th>Km</th><th>Source</th></tr></thead><tbody>${kmRows}</tbody></table>` : ''}
    </div>` : ''}

    <!-- Contrôle technique -->
    ${ct.last_date ? `
    <div class="cv-section">
        <h5 class="cv-section-title">Contrôles techniques</h5>
        <div class="cv-ct-last">
            <span class="cv-badge ${ct.result === 'FAVORABLE' ? 'cv-ok' : 'cv-warn'}">${ct.result || '—'}</span>
            <span>Dernier CT : ${fmtDate(ct.last_date)}</span>
            ${ct.defects_minor != null ? `<span class="cv-defects">${ct.defects_minor} défaut(s) mineur(s)</span>` : ''}
            ${ct.defects_critical != null && ct.defects_critical > 0 ? `<span class="cv-defects cv-warn-text">${ct.defects_critical} défaut(s) critique(s)</span>` : ''}
        </div>
        ${ctRows ? `<table class="cv-table"><thead><tr><th>Date</th><th>Résultat</th><th>Km</th></tr></thead><tbody>${ctRows}</tbody></table>` : ''}
    </div>` : ''}

    <!-- Accidents détail -->
    ${!accOk && accRows ? `
    <div class="cv-section">
        <h5 class="cv-section-title">Historique des sinistres</h5>
        <ul class="cv-list">${accRows}</ul>
    </div>` : ''}

    <!-- Propriétaires -->
    ${own.count != null ? `
    <div class="cv-section">
        <h5 class="cv-section-title">Propriétaires</h5>
        <p class="cv-owners-count">${own.count} propriétaire(s) enregistré(s)</p>
    </div>` : ''}

    <p class="cv-powered">Données fournies par <strong>CarVertical</strong> — Base pan-européenne</p>
</div>`;
    }

    function pendingHTML() {
        return `
<div class="cv-pending">
    <div class="cv-pending-icon">🔄</div>
    <p class="cv-pending-title">Rapport complet bientôt disponible</p>
    <p class="cv-pending-desc">L'intégration CarVertical (accidents, km réels, vol, gage, CT) est en cours d'activation. Revenez très prochainement.</p>
</div>`;
    }

    function errorHTML(msg) {
        return `<div class="cv-error"><p>Impossible de récupérer le rapport : ${msg}</p></div>`;
    }

    function fmtDate(str) {
        if (!str) return '—';
        try {
            return new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return str; }
    }

    function fmtKm(val) {
        if (val == null) return '—';
        return Number(val).toLocaleString('fr-FR') + ' km';
    }

    // ---- API publique ----
    return {
        /**
         * Appeler après déverrouillage du rapport.
         * @param {string} plate  - Plaque d'immatriculation
         * @param {HTMLElement} container - Élément DOM où injecter le rapport
         */
        load: async function (plate, container) {
            if (!container) return;
            container.innerHTML = loadingHTML();
            try {
                const data = await fetchReport(plate);
                render(data, container);
            } catch (err) {
                container.innerHTML = errorHTML(err.message);
            }
        }
    };

    function loadingHTML() {
        return `
<div class="cv-loading">
    <div class="cv-spinner"></div>
    <p>Vérification CarVertical en cours…</p>
</div>`;
    }

})();
