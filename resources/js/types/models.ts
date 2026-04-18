export type Localite = {
    id: number;
    code_localite: string;
    nom_localite: string;
};

export type Site = {
    id: number;
    code_site: string;
    nom_site: string;
};

export type Produit = {
    id: number;
    code_produit: string;
    nom_produit: string;
};

export type Section = {
    id: number;
    code_section: string;
    nom_section: string;
    taux_defaut: number;
    produit_id: number;
    produit?: Produit;
};

export type Personnel = {
    id: number;
    matricule: string;
    nom: string;
    prenom: string;
    surnom: string | null;
    sexe: 'M' | 'F';
    date_naissance: string;
    lieu_naissance: string;
    num_acte_naissance: string | null;
    num_cnib: string;
    date_cnib: string | null;
    lieu_cnib: string | null;
    num_cnss: string | null;
    telephone: string;
    tel_compte_wave: string | null;
    est_marie: boolean;
    nb_charge: number;
    niveau_etude: string | null;
    classification: string | null;
    localite_domicile_id: number;
    site_travail_id: number;
    section_defaut_id: number;
    actif: boolean;
    preference_paiement: 'ESPECES' | 'WAVE';
    localite_domicile?: Localite;
    site_travail?: Site;
    section_defaut?: Section;
    created_at: string;
    updated_at: string;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
};
