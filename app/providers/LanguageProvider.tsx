"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';

type Language = 'en' | 'hr';

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
};

// Translations dictionary
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.marketplace': 'Marketplace',
    'nav.dashboard': 'Dashboard',
    'nav.messages': 'Messages',
    'nav.admin': 'Admin',
    'nav.profile': 'Profile',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Logout',
    'nav.newListing': '+ New Listing',
    
    // Listings
    'listing.back': 'Back to listings',
    'listing.edit': 'Edit Listing',
    'listing.markSold': 'Mark as Sold',
    'listing.processing': 'Processing...',
    'listing.sold': 'Sold',
    'listing.category': 'Category',
    'listing.price': '€',
    'listing.location': 'Location',
    'listing.description': 'Description',
    'listing.condition': 'Condition',
    'listing.contactSeller': 'Contact Seller',
    'listing.sellerInfo': 'Seller Information',
    'listing.memberSince': 'Member since',
    'listing.listedOn': 'Listed on',
    'listing.noDescription': 'No description provided.',
    'listing.notSpecified': 'Not specified',
    'listing.viewAll': 'View All Listings',
    'listing.search': 'Search listings...',
    'listing.filter': 'Filter',
    'listing.sort': 'Sort',
    'listing.newest': 'Newest',
    'listing.oldest': 'Oldest',
    'listing.priceLowHigh': 'Price: Low to High',
    'listing.priceHighLow': 'Price: High to Low',
    
    // Profile
    'profile.title': 'Your Profile',
    'profile.accountDetails': 'Account Details',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.verificationStatus': 'Verification Status',
    'profile.verified': 'Verified',
    'profile.notVerified': 'Not Verified',
    'profile.notProvided': 'Not provided',
    'profile.editProfile': 'Edit Profile',
    'profile.backToDashboard': 'Back to Dashboard',
    'profile.activeListings': 'Active Listings',
    'profile.soldItems': 'Sold Items',
    'profile.favorites': 'Favorites',
    'profile.noActiveListings': 'You don\'t have any active listings.',
    'profile.noSoldItems': 'You haven\'t sold any items yet.',
    'profile.noFavorites': 'You don\'t have any favorites yet.',
    'profile.viewListing': 'View Listing',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.verifyPrompt': 'Verify your account to start selling items',
    'dashboard.verifyNow': 'Verify Now',
    'dashboard.stats': 'Your Statistics',
    'dashboard.activeSales': 'Active Sales',
    'dashboard.totalSold': 'Total Sold',
    'dashboard.totalViews': 'Total Views',
    'dashboard.messages': 'Messages',
    'dashboard.recentListings': 'Recent Listings',
    'dashboard.noListings': 'You don\'t have any listings yet.',
    'dashboard.createFirst': 'Create your first listing',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.newListing': 'New Listing',
    'dashboard.viewMessages': 'View Messages',
    'dashboard.editProfile': 'Edit Profile',
    'dashboard.browseMarketplace': 'Browse Marketplace',
    
    // Admin
    'admin.dashboard': 'Admin Dashboard',
    'admin.listings': 'Manage Listings',
    'admin.users': 'Manage Users',
    'admin.reports': 'Reports',
    'admin.settings': 'Site Settings',
    'admin.edit': 'Edit',
    'admin.delete': 'Delete',
    'admin.confirm': 'Confirm',
    'admin.cancel': 'Cancel',
    'admin.save': 'Save Changes',
    'admin.deleteConfirm': 'Are you sure you want to delete this item?',
    'admin.editListing': 'Edit Listing',
    'admin.title': 'Title',
    'admin.description': 'Description',
    'admin.price': 'Price',
    'admin.condition': 'Condition',
    'admin.location': 'Location',
    'admin.category': 'Category',
    'admin.images': 'Images',
    'admin.addImages': 'Add Images',
    'admin.removeImage': 'Remove',
    'admin.moveUp': 'Up',
    'admin.moveDown': 'Down',
    'admin.uploading': 'Uploading...',
    
    // Messages
    'messages.title': 'Messages',
    'messages.noMessages': 'You don\'t have any messages yet.',
    'messages.send': 'Send',
    'messages.typeMessage': 'Type a message...',
    'messages.from': 'From',
    'messages.to': 'To',
    'messages.about': 'About',
    'messages.lastMessage': 'Last message',
    'messages.viewConversation': 'View',
    'messages.back': 'Back to Messages',
    'messages.conversation': 'Conversation with',
    
    // Home page
    'home.welcome': 'Welcome to RealDeal',
    'home.subtitle': 'A trusted marketplace for buying and selling goods, with authentication and real users.',
    'home.signup': 'Sign Up',
    'home.browse': 'Browse Listings',
    'home.dashboard': 'My Dashboard',
    'home.create': 'Create Listing',
    'home.featuredListings': 'Featured Listings',
    'home.featuredSubtitle': 'Check out some of our latest items for sale',
    'home.noListings': 'No listings available at the moment.',
    'home.viewAll': 'View All Listings',
    'home.categories': 'Categories',
    'home.categoriesSubtitle': 'Browse items by category',
    'home.howItWorks': 'How It Works',
    'home.step1': 'Create an account',
    'home.step2': 'Verify your identity',
    'home.step3': 'Buy or sell with confidence',
    'home.whyChoose': 'Why Choose RealDeal?',
    'home.reason1': 'Verified Users',
    'home.reason2': 'Secure Payments',
    'home.reason3': 'No Scams',
    
    // General
    'general.loading': 'Loading...',
    'general.error': 'An error occurred',
    'general.retry': 'Retry',
    'general.save': 'Save',
    'general.cancel': 'Cancel',
    'general.submit': 'Submit',
    'general.delete': 'Delete',
    'general.edit': 'Edit',
    'general.search': 'Search',
    'general.filter': 'Filter',
    'general.sort': 'Sort',
    'general.noResults': 'No results found',
  },
  
  hr: {
    // Navigation
    'nav.home': 'Početna',
    'nav.marketplace': 'Tržnica',
    'nav.dashboard': 'Kontrolna ploča',
    'nav.messages': 'Poruke',
    'nav.admin': 'Admin',
    'nav.profile': 'Profil',
    'nav.login': 'Prijava',
    'nav.signup': 'Registracija',
    'nav.logout': 'Odjava',
    'nav.newListing': '+ Novi oglas',
    
    // Listings
    'listing.back': 'Natrag na oglase',
    'listing.edit': 'Uredi oglas',
    'listing.markSold': 'Označi kao prodano',
    'listing.processing': 'Obrada...',
    'listing.sold': 'Prodano',
    'listing.category': 'Kategorija',
    'listing.price': '€',
    'listing.location': 'Lokacija',
    'listing.description': 'Opis',
    'listing.condition': 'Stanje',
    'listing.contactSeller': 'Kontaktiraj prodavača',
    'listing.sellerInfo': 'Informacije o prodavaču',
    'listing.memberSince': 'Član od',
    'listing.listedOn': 'Objavljeno',
    'listing.noDescription': 'Nema opisa.',
    'listing.notSpecified': 'Nije navedeno',
    'listing.viewAll': 'Pregledaj sve oglase',
    'listing.search': 'Pretraži oglase...',
    'listing.filter': 'Filtriraj',
    'listing.sort': 'Sortiraj',
    'listing.newest': 'Najnovije',
    'listing.oldest': 'Najstarije',
    'listing.priceLowHigh': 'Cijena: Od niže prema višoj',
    'listing.priceHighLow': 'Cijena: Od više prema nižoj',
    
    // Profile
    'profile.title': 'Vaš profil',
    'profile.accountDetails': 'Detalji računa',
    'profile.name': 'Ime',
    'profile.email': 'Email',
    'profile.verificationStatus': 'Status verifikacije',
    'profile.verified': 'Verificiran',
    'profile.notVerified': 'Nije verificiran',
    'profile.notProvided': 'Nije navedeno',
    'profile.editProfile': 'Uredi profil',
    'profile.backToDashboard': 'Natrag na kontrolnu ploču',
    'profile.activeListings': 'Aktivni oglasi',
    'profile.soldItems': 'Prodani artikli',
    'profile.favorites': 'Favoriti',
    'profile.noActiveListings': 'Nemate aktivnih oglasa.',
    'profile.noSoldItems': 'Još niste prodali niti jedan artikl.',
    'profile.noFavorites': 'Nemate favorita.',
    'profile.viewListing': 'Pregledaj oglas',
    
    // Dashboard
    'dashboard.welcome': 'Dobrodošli',
    'dashboard.verifyPrompt': 'Verificirajte račun kako biste mogli prodavati artikle',
    'dashboard.verifyNow': 'Verificiraj sada',
    'dashboard.stats': 'Vaša statistika',
    'dashboard.activeSales': 'Aktivne prodaje',
    'dashboard.totalSold': 'Ukupno prodano',
    'dashboard.totalViews': 'Ukupno pregleda',
    'dashboard.messages': 'Poruke',
    'dashboard.recentListings': 'Nedavni oglasi',
    'dashboard.noListings': 'Još nemate kreiranih oglasa.',
    'dashboard.createFirst': 'Kreirajte svoj prvi oglas',
    'dashboard.quickActions': 'Brze akcije',
    'dashboard.newListing': 'Novi oglas',
    'dashboard.viewMessages': 'Pregledaj poruke',
    'dashboard.editProfile': 'Uredi profil',
    'dashboard.browseMarketplace': 'Pregledaj tržnicu',
    
    // Admin
    'admin.dashboard': 'Admin kontrolna ploča',
    'admin.listings': 'Upravljanje oglasima',
    'admin.users': 'Upravljanje korisnicima',
    'admin.reports': 'Izvještaji',
    'admin.settings': 'Postavke stranice',
    'admin.edit': 'Uredi',
    'admin.delete': 'Izbriši',
    'admin.confirm': 'Potvrdi',
    'admin.cancel': 'Odustani',
    'admin.save': 'Spremi promjene',
    'admin.deleteConfirm': 'Jeste li sigurni da želite izbrisati ovu stavku?',
    'admin.editListing': 'Uredi oglas',
    'admin.title': 'Naslov',
    'admin.description': 'Opis',
    'admin.price': 'Cijena',
    'admin.condition': 'Stanje',
    'admin.location': 'Lokacija',
    'admin.category': 'Kategorija',
    'admin.images': 'Slike',
    'admin.addImages': 'Dodaj slike',
    'admin.removeImage': 'Ukloni',
    'admin.moveUp': 'Gore',
    'admin.moveDown': 'Dolje',
    'admin.uploading': 'Učitavanje...',
    
    // Messages
    'messages.title': 'Poruke',
    'messages.noMessages': 'Nemate poruka.',
    'messages.send': 'Pošalji',
    'messages.typeMessage': 'Upiši poruku...',
    'messages.from': 'Od',
    'messages.to': 'Za',
    'messages.about': 'O',
    'messages.lastMessage': 'Zadnja poruka',
    'messages.viewConversation': 'Pregledaj',
    'messages.back': 'Natrag na poruke',
    'messages.conversation': 'Razgovor s',
    
    // Home page
    'home.welcome': 'Dobrodošli na RealDeal',
    'home.subtitle': 'Pouzdana tržnica za kupnju i prodaju robe, s autentifikacijom i stvarnim korisnicima.',
    'home.signup': 'Registracija',
    'home.browse': 'Pregledaj oglase',
    'home.dashboard': 'Moja kontrolna ploča',
    'home.create': 'Kreiraj oglas',
    'home.featuredListings': 'Istaknuti oglasi',
    'home.featuredSubtitle': 'Pogledajte neke od naših najnovijih artikala za prodaju',
    'home.noListings': 'Trenutno nema dostupnih oglasa.',
    'home.viewAll': 'Pregledaj sve oglase',
    'home.categories': 'Kategorije',
    'home.categoriesSubtitle': 'Pregledaj artikle po kategorijama',
    'home.howItWorks': 'Kako funkcionira',
    'home.step1': 'Kreirajte račun',
    'home.step2': 'Verificirajte svoj identitet',
    'home.step3': 'Kupujte ili prodajte s povjerenjem',
    'home.whyChoose': 'Zašto odabrati RealDeal?',
    'home.reason1': 'Verificirani korisnici',
    'home.reason2': 'Sigurna plaćanja',
    'home.reason3': 'Bez prijevara',
    
    // General
    'general.loading': 'Učitavanje...',
    'general.error': 'Došlo je do pogreške',
    'general.retry': 'Pokušaj ponovo',
    'general.save': 'Spremi',
    'general.cancel': 'Odustani',
    'general.submit': 'Pošalji',
    'general.delete': 'Izbriši',
    'general.edit': 'Uredi',
    'general.search': 'Pretraži',
    'general.filter': 'Filtriraj',
    'general.sort': 'Sortiraj',
    'general.noResults': 'Nema rezultata',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('hr'); // Default to Croatian

  useEffect(() => {
    // Load language from localStorage if available
    const savedLanguage = localStorage.getItem('language') as Language;
    
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hr')) {
      setLanguage(savedLanguage);
    } else {
      // If no language preference found, set Croatian as default
      localStorage.setItem('language', 'hr');
    }
    
    // Add a language attribute to the html element for better accessibility
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'hr' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    document.documentElement.setAttribute('lang', newLanguage);
    
    // Force update on language change to ensure all components re-render
    window.dispatchEvent(new Event('languageChange'));
  };

  // Translation function
  const t = (key: string): string => {
    const currentTranslations = translations[language];
    return currentTranslations[key as keyof typeof currentTranslations] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 