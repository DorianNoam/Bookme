-- ============================================
-- BOOKME.DZ - Schema PostgreSQL pour Supabase
-- Migré depuis MySQL bookme_db
-- ============================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE : users (clients)
-- ============================================
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  prenom      VARCHAR(50)  NOT NULL,
  nom         VARCHAR(50)  NOT NULL,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  telephone   VARCHAR(20)  DEFAULT '',
  token       VARCHAR(255) DEFAULT NULL,
  token_expire TIMESTAMP   DEFAULT NULL,
  created_at  TIMESTAMP    DEFAULT NOW()
);

-- ============================================
-- TABLE : pros (propriétaires de salons)
-- ============================================
CREATE TABLE pros (
  id               SERIAL PRIMARY KEY,
  prenom           VARCHAR(100) NOT NULL,
  nom              VARCHAR(100) NOT NULL,
  email            VARCHAR(255) NOT NULL UNIQUE,
  password         VARCHAR(255) NOT NULL,
  telephone        VARCHAR(20)  DEFAULT NULL,
  a_paye           INT          DEFAULT 0,
  preuve_paiement  VARCHAR(255) DEFAULT NULL,
  created_at       TIMESTAMP    DEFAULT NOW(),
  token            VARCHAR(255) DEFAULT NULL,
  token_expire     TIMESTAMP    DEFAULT NULL
);

-- ============================================
-- TABLE : salons
-- ============================================
CREATE TABLE salons (
  id          SERIAL PRIMARY KEY,
  nom         VARCHAR(100) NOT NULL,
  adresse     VARCHAR(255) NOT NULL,
  image       TEXT         NOT NULL,
  pro_id      INT          NOT NULL REFERENCES pros(id) ON DELETE CASCADE,
  ouverture   TIME         DEFAULT '09:00:00',
  fermeture   TIME         DEFAULT '19:00:00',
  jour_off    INT          DEFAULT 0,  -- 0=aucun, 1=Lun ... 7=Dim
  type_salon  VARCHAR(50)  DEFAULT 'Coiffure',
  telephone   VARCHAR(20)  DEFAULT NULL,
  description TEXT         DEFAULT NULL,
  ville       VARCHAR(100) DEFAULT NULL,
  created_at  TIMESTAMP    DEFAULT NOW()
);

-- ============================================
-- TABLE : salon_images (galerie)
-- ============================================
CREATE TABLE salon_images (
  id          SERIAL PRIMARY KEY,
  salon_id    INT    NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  image_path  VARCHAR(255) NOT NULL
);

-- ============================================
-- TABLE : employes
-- ============================================
CREATE TABLE employes (
  id        SERIAL PRIMARY KEY,
  salon_id  INT          NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  nom       VARCHAR(100) NOT NULL
);

-- ============================================
-- TABLE : catalogue_services (référentiel global)
-- ============================================
CREATE TABLE catalogue_services (
  id        SERIAL PRIMARY KEY,
  categorie VARCHAR(50)  NOT NULL,
  nom       VARCHAR(100) NOT NULL
);

-- ============================================
-- TABLE : services (par salon)
-- ============================================
CREATE TABLE services (
  id                SERIAL PRIMARY KEY,
  salon_id          INT          NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  nom               VARCHAR(100) NOT NULL,
  prix              INT          NOT NULL,
  duree             INT          NOT NULL DEFAULT 30,  -- en minutes
  categorie_service VARCHAR(50)  DEFAULT 'Général'
);

-- ============================================
-- TABLE : reservations
-- ============================================
CREATE TABLE reservations (
  id            SERIAL PRIMARY KEY,
  salon_id      INT          NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  user_id       INT          DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  employe_id    INT          DEFAULT NULL REFERENCES employes(id) ON DELETE SET NULL,
  service_id    INT          DEFAULT NULL REFERENCES services(id) ON DELETE SET NULL,
  service_nom   VARCHAR(255) NOT NULL,
  service_prix  DECIMAL(10,2) NOT NULL,
  client_nom    VARCHAR(100) NOT NULL,
  date_rdv      TIMESTAMP    NOT NULL,
  statut        VARCHAR(20)  DEFAULT 'confirme',  -- confirme | annule | termine | no_show
  created_at    TIMESTAMP    DEFAULT NOW()
);

-- ============================================
-- TABLE : avis
-- ============================================
CREATE TABLE avis (
  id            SERIAL PRIMARY KEY,
  user_id       INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  salon_id      INT          NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  note          INT          NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire   TEXT         DEFAULT NULL,
  note_accueil  INT          DEFAULT 5 CHECK (note_accueil BETWEEN 1 AND 5),
  note_proprete INT          DEFAULT 5 CHECK (note_proprete BETWEEN 1 AND 5),
  note_ambiance INT          DEFAULT 5 CHECK (note_ambiance BETWEEN 1 AND 5),
  note_qualite  INT          DEFAULT 5 CHECK (note_qualite BETWEEN 1 AND 5),
  date_avis     TIMESTAMP    DEFAULT NOW()
);

-- ============================================
-- TABLE : blacklist
-- ============================================
CREATE TABLE blacklist (
  id           SERIAL PRIMARY KEY,
  salon_id     INT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  user_id      INT NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  date_blocage TIMESTAMP DEFAULT NOW(),
  UNIQUE (salon_id, user_id)
);

-- ============================================
-- DONNÉES : catalogue_services (70 services)
-- ============================================
INSERT INTO catalogue_services (categorie, nom) VALUES
('Coiffure', 'Coupe Femme'), ('Coiffure', 'Brushing'), ('Coiffure', 'Coupe + Brushing'),
('Coiffure', 'Coloration Racine'), ('Coiffure', 'Coloration Complète'), ('Coiffure', 'Mèches / Balayage'),
('Coiffure', 'Ombré Hair'), ('Coiffure', 'Lissage Brésilien'), ('Coiffure', 'Soin Keratine'),
('Coiffure', 'Patine / Gloss'), ('Coiffure', 'Permanente'), ('Coiffure', 'Défrisage'),
('Coiffure', 'Soin Botox Capillaire'), ('Coiffure', 'Lissage Tanin'), ('Coiffure', 'Lissage Indien'),
('Coiffure', 'Coupe Enfant (-12 ans)'), ('Coiffure', 'Coupe Bébé'), ('Coiffure', 'Chignon Mariée'),
('Coiffure', 'Coiffure de Soirée / Wavy'), ('Coiffure', 'Tresses / Nattes'), ('Coiffure', 'Pose d''extensions'),
('Barbier', 'Coupe Homme'), ('Barbier', 'Taille de Barbe'), ('Barbier', 'Rasage à l''ancienne'),
('Barbier', 'Coupe + Barbe'), ('Barbier', 'Coloration Barbe'), ('Barbier', 'Soin Visage Homme'),
('Barbier', 'Épilation Cire (Nez/Oreilles)'), ('Barbier', 'Défrisage Barbe'), ('Barbier', 'Teinture Cheveux Homme'),
('Onglerie', 'Pose Vernis Semi-Permanent'), ('Onglerie', 'Pose Gel (Capsules)'), ('Onglerie', 'Remplissage Gel'),
('Onglerie', 'Dépose'), ('Onglerie', 'Manucure Russe'), ('Onglerie', 'Baby Boomer'),
('Onglerie', 'French Manucure'), ('Onglerie', 'Gainage Ongles Naturels'), ('Onglerie', 'Réparation Ongle Cassé'),
('Onglerie', 'Pose Américaine (Gel X)'), ('Onglerie', 'Beauté des Pieds Spa'),
('Esthétique', 'Soin Visage Hydratant'), ('Esthétique', 'Soin Anti-Âge'), ('Esthétique', 'Microneedling'),
('Esthétique', 'Hydrafacial'), ('Esthétique', 'Peeling Chimique'), ('Esthétique', 'Brow Lift'),
('Esthétique', 'Lash Lift'), ('Esthétique', 'Teinture Sourcils'), ('Esthétique', 'Teinture Cils'),
('Esthétique', 'Extensions Cils (Cil à Cil)'), ('Esthétique', 'Extensions Cils (Volume Russe)'),
('Esthétique', 'Microblading'), ('Esthétique', 'Épilation Sourcils'), ('Esthétique', 'Épilation Lèvres'),
('Esthétique', 'Épilation Aisselles'), ('Esthétique', 'Épilation Jambes'),
('Esthétique', 'Épilation Maillot Classique'), ('Esthétique', 'Épilation Maillot Brésilien'),
('Esthétique', 'Épilation Maillot Intégral'), ('Esthétique', 'Épilation Dos/Torse'),
('Esthétique', 'Massage Relaxant (1h)'), ('Esthétique', 'Massage Californien'),
('Esthétique', 'Massage Pierres Chaudes'), ('Esthétique', 'Gommage Corps'),
('Esthétique', 'Drainage Lymphatique'), ('Esthétique', 'Maderothérapie'),
('Esthétique', 'Maquillage Jour / Nude'), ('Esthétique', 'Maquillage Soirée'),
('Esthétique', 'Maquillage Mariée (avec essai)');

-- ============================================
-- INDEX pour les performances
-- ============================================
CREATE INDEX idx_salons_ville       ON salons(ville);
CREATE INDEX idx_salons_type        ON salons(type_salon);
CREATE INDEX idx_salons_pro         ON salons(pro_id);
CREATE INDEX idx_services_salon     ON services(salon_id);
CREATE INDEX idx_employes_salon     ON employes(salon_id);
CREATE INDEX idx_reservations_salon ON reservations(salon_id);
CREATE INDEX idx_reservations_user  ON reservations(user_id);
CREATE INDEX idx_reservations_date  ON reservations(date_rdv);
CREATE INDEX idx_avis_salon         ON avis(salon_id);
