# LER EduShare — Aplicație React & Bază de Date (Producție Strictă)
### Sistem Instituțional de Resurse Didactice Verificate și Mentorat
**Mobilitatea Erasmus+ DIGI-EQUAL | Liceul Teoretic „Emil Racoviță” Vaslui**

---

## 1. Arhitectura de Securitate Strictă (Role-Based Access Control)

Aplicația rulează în regim de **producție securizat**, fără scurtături demonstrative:

### 🎓 1. Rolul ELEV
* **Acces permis**:
  * Consultare catalog de resurse publice și căutare avansată.
  * Formulare întrebări către autori în modulul de mentorat peer-to-peer.
  * Propunere materiale noi prin butonul *„Propune Material”* (acestea ajung la administrator).
  * Vizualizare propriul istoric în tab-ul *„Materialele Mele”*.
* **Restricții stricte**:
  * **NU** poate accesa sau vedea panoul *„Moderare Admin”*.
  * **NU** poate accesa sau vedea registrul *„Sesizări Profesori”*.
  * **NU** are butoane de verificare didactică (*„Acordă Aviz”*) și **nu** poate valida materiale.
  * **NU** poate șterge sau retrage materiale din catalog.

---

### 👨‍🏫 2. Rolul CADRU DIDACTIC (Profesor)
* **Acces permis**:
  * Consultare catalog public.
  * **Avizare didactică oficială**: Butonul *„Acordă Aviz”* pentru certificarea științifică a materialelor didactice cu mențiuni metodice.
  * **Sesizare neconformități**: Butonul *„Semnalează”* prin care înaintează cereri de retragere către administrator sau instrucțiuni de rectificare direct către elevul autor.
  * Acces la registrul *„Sesizări Profesori”*.
* **Restricții stricte**:
  * **NU** poate accesa panoul *„Moderare Admin”* (doar administratorul autorizează apariția inițială a resurselor).
  * **NU** poate șterge direct resursele fără procedura de sesizare/retragere.

---

### 🛡️ 3. Rolul ADMINISTRATOR
* **Acces exclusiv**:
  * Panoul dedicat **„Moderare Admin”** unde autorizează (*„Autorizează Publicarea”*) sau respinge propunerile înainte de a deveni publice.
  * Gestionarea sesizărilor din registrul *„Sesizări Profesori”* și retragerea definitivă a materialelor din catalog (*„Retrage Resursa din Catalog”*).
  * Eliminare directă de materiale neconforme.

---

## 2. Conturile Preconfigurate pentru Testare

Pentru a testa fiecare rol în mod separat, folosește formularul de **Conectare**:

| Rol | Adresă Email | Parolă | Permisiuni |
| :--- | :--- | :--- | :--- |
| **Elev** | `elev@ler.ro` | `elev123` | Doar catalog, propunere resurse & mentorat |
| **Profesor** | `profesor@ler.ro` | `prof123` | Avizare didactică & semnalare erori |
| **Administrator** | `admin@ler.ro` | `admin123` | Moderare prealabilă & retragere conținut |

*De asemenea, orice utilizator nou își poate crea cont de **Elev** sau **Profesor** prin butonul **„Înregistrare”**.*

---

## 3. Rulare Locală

* **Cu fișierul batch**: Dublu-click pe [start-app.bat](file:///c:/Users/rares/Desktop/erasmus/start-app.bat).
* **Din terminal**:
```bash
npm run dev
```

---

## 4. Găzduire pe Vercel

1. Încarcă proiectul pe GitHub.
2. Intră pe [Vercel](https://vercel.com) și alege depozitul GitHub.
3. Vercel va rula automat `npm run build` și va publica folderul `dist`.
4. Rutarea este complet configurată prin `vercel.json`.
