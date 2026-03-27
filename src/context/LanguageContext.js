import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
];

export const translations = {
  en: {
    // Navigation
    'joynest': 'JoyNest',
    'event_management': 'Event Management',
    'sign_in': 'Sign In',
    'get_started': 'Get Started',
    'dashboard': 'Dashboard',
    'logout': 'Logout',
    'back_to_home': 'Back to Home',
    
    // Landing Page
    'ai_powered': '✨ AI-Powered Platform',
    'plan_perfect_events': 'Plan Perfect Events with',
    'hero_description': 'From intimate gatherings to grand celebrations, we make event planning effortless with intelligent tools and trusted vendor network.',
    'get_started_free': 'Get Started Free',
    'watch_demo': 'Watch Demo',
    'why_choose_us': 'Why Choose Us',
    'everything_you_need': 'Everything You Need to',
    'create_amazing_events': 'Create Amazing Events',
    'features_description': 'Powerful features that make event planning simple, efficient, and enjoyable',
    'ready_to_create': 'Ready to Create Your Next Event?',
    'join_thousands': 'Join thousands of event organizers who trust JoyNest',
    'create_first_event': 'Create Your First Event',
    
    // Features
    'ai_assistant': 'AI Event Assistant',
    'ai_assistant_desc': 'Get personalized event planning suggestions powered by advanced AI technology.',
    'vendor_network': 'Vendor Network',
    'vendor_network_desc': 'Connect with 1000+ verified vendors for catering, photography, venues and more.',
    'smart_invitations': 'Smart Invitations',
    'smart_invitations_desc': 'Create beautiful digital invitations with real-time RSVP tracking and analytics.',
    'event_analytics': 'Event Analytics',
    'event_analytics_desc': 'Track your event performance with detailed insights and actionable data.',
    
    // Auth Pages
    'welcome_back': 'Welcome Back',
    'sign_in_account': 'Sign in to your JoyNest account',
    'email_username': 'Email or Username',
    'password': 'Password',
    'forgot_password': 'Forgot Password?',
    'no_account': 'Don\'t have an account?',
    'register_here': 'Register here',
    'back': 'Back',
    
    // Role Selection
    'join_joynest': 'Join JoyNest',
    'choose_role': 'Choose how you want to use our platform',
    'event_planner': 'Event Planner',
    'event_planner_desc': 'I want to plan events, manage invitations, and book vendors',
    'vendor': 'Vendor',
    'vendor_desc': 'I provide event services and want to connect with clients',
    'continue_as_user': 'Continue as User',
    'continue_as_vendor': 'Continue as Vendor',
    'already_have_account': 'Already have an account?',
    'sign_in_here': 'Sign in here',
    
    // Registration
    'create_user_account': 'Create User Account',
    'join_as_planner': 'Join JoyNest as an Event Planner',
    'full_name': 'Full Name',
    'email_address': 'Email Address',
    'phone_number': 'Phone Number',
    'username': 'Username',
    'create_password': 'Create password',
    'create_account': 'Create Account',
    'back_to_role': 'Back to Role Selection',
    
    // Vendor Registration
    'vendor_registration': 'Vendor Registration',
    'join_vendor_network': 'Join our network of professional event vendors',
    'business_name': 'Business Name',
    'service_category': 'Service Category',
    'select_service': 'Select your service',
    'catering': 'Catering',
    'photography': 'Photography',
    'venue': 'Venue',
    'decoration': 'Decoration',
    'entertainment': 'Entertainment',
    'audio_visual': 'Audio Visual',
    'designer': 'Designer',
    'budget_min': 'Budget Min (₹)',
    'budget_max': 'Budget Max (₹)',
    'contact_phone': 'Contact Phone',
    'description': 'Description',
    'register_as_vendor': 'Register as Vendor',
    
    // Dashboard
    'welcome': 'Welcome',
    'plan_organize': 'Plan, organize, and execute perfect events with our AI-powered tools',
    'active_events': 'Active Events',
    'invitations': 'Invitations',
    'notes': 'Notes',
    'upcoming': 'Upcoming',
    'ai_assistant_tab': 'AI Assistant',
    'create_event_tab': 'Create Event',
    'find_vendors_tab': 'Find Vendors',
    'my_events_tab': 'My Events',
    'invitations_tab': 'Invitations',
    'describe_event': 'Describe your event (type, guests, budget, etc.) and I\'ll create a complete plan with vendor recommendations.',
    'send': 'Send',
    'create_new_event': 'Create New Event',
    'start_planning': 'Start planning your next perfect event',
    'browse_vendors': 'Browse Vendors',
    'no_events': 'No events created yet. Create your first event!',
    'no_invitations': 'No invitations created yet. Create your first invitation!',
    
    // Invitation Modal
    'premium_designer': 'Premium Invitation Designer',
    'create_stunning': 'Create stunning invitations with 15 templates, custom fonts, and color controls',
    'basic_info': 'Basic Information',
    'event_type': 'Event Type',
    'wedding': 'Wedding',
    'engagement': 'Engagement',
    'birthday': 'Birthday Party',
    'anniversary': 'Anniversary',
    'corporate': 'Corporate Event',
    'baby_shower': 'Baby Shower',
    'graduation': 'Graduation',
    'housewarming': 'Housewarming',
    'primary_name': 'Primary Name',
    'secondary_name': 'Secondary Name',
    'tagline': 'Tagline / Description',
    'date': 'Date',
    'time': 'Time',
    'venue_name': 'Venue Name',
    'address': 'Address',
    'add_photo': 'Add Photo (Optional)',
    'choose_template': 'Choose Design Template',
    'font_style': 'Font Style',
    'color_custom': 'Color Customization',
    'font_color': 'Font Color',
    'accent_color': 'Accent Color',
    'custom_color': 'Custom Color',
    'live_preview': 'Live Preview',
    'download_png': 'PNG',
    'download_pdf': 'PDF',
    'share': 'Share',
    'save': 'Save'
  },
  
  hi: {
    // Navigation
    'joynest': 'जॉयनेस्ट',
    'event_management': 'इवेंट मैनेजमेंट',
    'sign_in': 'साइन इन',
    'get_started': 'शुरू करें',
    'dashboard': 'डैशबोर्ड',
    'logout': 'लॉग आउट',
    'back_to_home': 'होम पर वापस',
    
    // Landing Page
    'ai_powered': '✨ एआई-पावर्ड प्लेटफॉर्म',
    'plan_perfect_events': 'परफेक्ट इवेंट प्लान करें',
    'hero_description': 'छोटी सभाओं से लेकर भव्य समारोहों तक, हम बुद्धिमान उपकरणों और विश्वसनीय विक्रेता नेटवर्क के साथ इवेंट प्लानिंग को सरल बनाते हैं।',
    'get_started_free': 'मुफ्त में शुरू करें',
    'watch_demo': 'डेमो देखें',
    'why_choose_us': 'हमें क्यों चुनें',
    'everything_you_need': 'आपको जो कुछ भी चाहिए',
    'create_amazing_events': 'शानदार इवेंट बनाएं',
    'features_description': 'शक्तिशाली सुविधाएं जो इवेंट प्लानिंग को सरल, कुशल और आनंददायक बनाती हैं',
    'ready_to_create': 'अपना अगला इवेंट बनाने के लिए तैयार हैं?',
    'join_thousands': 'हजारों इवेंट आयोजकों से जुड़ें जो जॉयनेस्ट पर भरोसा करते हैं',
    'create_first_event': 'अपना पहला इवेंट बनाएं',
    
    // Features
    'ai_assistant': 'एआई इवेंट असिस्टेंट',
    'ai_assistant_desc': 'उन्नत एआई तकनीक द्वारा संचालित व्यक्तिगत इवेंट प्लानिंग सुझाव प्राप्त करें।',
    'vendor_network': 'वेंडर नेटवर्क',
    'vendor_network_desc': 'केटरिंग, फोटोग्राफी, वेन्यू और अधिक के लिए 1000+ सत्यापित विक्रेताओं से जुड़ें।',
    'smart_invitations': 'स्मार्ट निमंत्रण',
    'smart_invitations_desc': 'रियल-टाइम आरएसवीपी ट्रैकिंग और एनालिटिक्स के साथ सुंदर डिजिटल निमंत्रण बनाएं।',
    'event_analytics': 'इवेंट एनालिटिक्स',
    'event_analytics_desc': 'विस्तृत जानकारी और कार्रवाई योग्य डेटा के साथ अपने इवेंट के प्रदर्शन को ट्रैक करें।',
    
    // Auth Pages
    'welcome_back': 'वापस स्वागत है',
    'sign_in_account': 'अपने जॉयनेस्ट खाते में साइन इन करें',
    'email_username': 'ईमेल या यूजरनेम',
    'password': 'पासवर्ड',
    'forgot_password': 'पासवर्ड भूल गए?',
    'no_account': 'खाता नहीं है?',
    'register_here': 'यहां रजिस्टर करें',
    'back': 'वापस',
    
    // Role Selection
    'join_joynest': 'जॉयनेस्ट से जुड़ें',
    'choose_role': 'हमारे प्लेटफॉर्म का उपयोग कैसे करना चाहते हैं चुनें',
    'event_planner': 'इवेंट प्लानर',
    'event_planner_desc': 'मैं इवेंट प्लान करना, निमंत्रण प्रबंधित करना और विक्रेताओं को बुक करना चाहता हूं',
    'vendor': 'वेंडर',
    'vendor_desc': 'मैं इवेंट सेवाएं प्रदान करता हूं और ग्राहकों से जुड़ना चाहता हूं',
    'continue_as_user': 'यूजर के रूप में जारी रखें',
    'continue_as_vendor': 'वेंडर के रूप में जारी रखें',
    'already_have_account': 'पहले से खाता है?',
    'sign_in_here': 'यहां साइन इन करें',
    
    // Registration
    'create_user_account': 'यूजर खाता बनाएं',
    'join_as_planner': 'जॉयनेस्ट में इवेंट प्लानर के रूप में शामिल हों',
    'full_name': 'पूरा नाम',
    'email_address': 'ईमेल पता',
    'phone_number': 'फोन नंबर',
    'username': 'यूजरनेम',
    'create_password': 'पासवर्ड बनाएं',
    'create_account': 'खाता बनाएं',
    'back_to_role': 'रोल चयन पर वापस',
    
    // Vendor Registration
    'vendor_registration': 'वेंडर रजिस्ट्रेशन',
    'join_vendor_network': 'पेशेवर इवेंट वेंडर्स के हमारे नेटवर्क से जुड़ें',
    'business_name': 'व्यवसाय का नाम',
    'service_category': 'सेवा श्रेणी',
    'select_service': 'अपनी सेवा चुनें',
    'catering': 'केटरिंग',
    'photography': 'फोटोग्राफी',
    'venue': 'वेन्यू',
    'decoration': 'सजावट',
    'entertainment': 'मनोरंजन',
    'audio_visual': 'ऑडियो विजुअल',
    'designer': 'डिजाइनर',
    'budget_min': 'बजट न्यूनतम (₹)',
    'budget_max': 'बजट अधिकतम (₹)',
    'contact_phone': 'संपर्क फोन',
    'description': 'विवरण',
    'register_as_vendor': 'वेंडर के रूप में रजिस्टर करें',
    
    // Dashboard
    'welcome': 'स्वागत है',
    'plan_organize': 'हमारे एआई-पावर्ड टूल्स के साथ परफेक्ट इवेंट की योजना बनाएं, व्यवस्थित करें और निष्पादित करें',
    'active_events': 'सक्रिय इवेंट',
    'invitations': 'निमंत्रण',
    'notes': 'नोट्स',
    'upcoming': 'आगामी',
    'ai_assistant_tab': 'एआई असिस्टेंट',
    'create_event_tab': 'इवेंट बनाएं',
    'find_vendors_tab': 'वेंडर खोजें',
    'my_events_tab': 'मेरे इवेंट',
    'invitations_tab': 'निमंत्रण',
    'describe_event': 'अपने इवेंट का वर्णन करें (प्रकार, मेहमान, बजट, आदि) और मैं विक्रेता सिफारिशों के साथ एक पूरी योजना बनाऊंगा।',
    'send': 'भेजें',
    'create_new_event': 'नया इवेंट बनाएं',
    'start_planning': 'अपना अगला परफेक्ट इवेंट प्लान करना शुरू करें',
    'browse_vendors': 'वेंडर ब्राउज़ करें',
    'no_events': 'अभी तक कोई इवेंट नहीं बनाया गया। अपना पहला इवेंट बनाएं!',
    'no_invitations': 'अभी तक कोई निमंत्रण नहीं बनाया गया। अपना पहला निमंत्रण बनाएं!',
    
    // Invitation Modal
    'premium_designer': 'प्रीमियम इनविटेशन डिजाइनर',
    'create_stunning': '15 टेम्पलेट्स, कस्टम फोंट और कलर कंट्रोल के साथ शानदार निमंत्रण बनाएं',
    'basic_info': 'मूल जानकारी',
    'event_type': 'इवेंट प्रकार',
    'wedding': 'शादी',
    'engagement': 'सगाई',
    'birthday': 'जन्मदिन',
    'anniversary': 'वर्षगांठ',
    'corporate': 'कॉर्पोरेट इवेंट',
    'baby_shower': 'बेबी शॉवर',
    'graduation': 'स्नातक',
    'housewarming': 'हाउस वार्मिंग',
    'primary_name': 'मुख्य नाम',
    'secondary_name': 'द्वितीयक नाम',
    'tagline': 'टैगलाइन / विवरण',
    'date': 'तारीख',
    'time': 'समय',
    'venue_name': 'स्थल का नाम',
    'address': 'पता',
    'add_photo': 'फोटो जोड़ें (वैकल्पिक)',
    'choose_template': 'डिजाइन टेम्पलेट चुनें',
    'font_style': 'फ़ॉन्ट शैली',
    'color_custom': 'रंग अनुकूलन',
    'font_color': 'फ़ॉन्ट रंग',
    'accent_color': 'एक्सेंट रंग',
    'custom_color': 'कस्टम रंग',
    'live_preview': 'लाइव प्रीव्यू',
    'download_png': 'पीएनजी',
    'download_pdf': 'पीडीएफ',
    'share': 'शेयर करें',
    'save': 'सेव करें'
  },
  
  mr: {
    // Navigation
    'joynest': 'जॉयनेस्ट',
    'event_management': 'इव्हेंट मॅनेजमेंट',
    'sign_in': 'साइन इन',
    'get_started': 'सुरू करा',
    'dashboard': 'डॅशबोर्ड',
    'logout': 'लॉग आउट',
    'back_to_home': 'होमवर परत',
    
    // Landing Page
    'ai_powered': '✨ एआय-पॉवर्ड प्लॅटफॉर्म',
    'plan_perfect_events': 'परफेक्ट इव्हेंट प्लॅन करा',
    'hero_description': 'लहान मेळाव्यांपासून ते भव्य समारंभांपर्यंत, आम्ही बुद्धिमान साधने आणि विश्वसनीय विक्रेता नेटवर्कसह इव्हेंट प्लॅनिंग सोपे करतो.',
    'get_started_free': 'विनामूल्य सुरू करा',
    'watch_demo': 'डेमो पहा',
    'why_choose_us': 'आम्ही का निवडाल',
    'everything_you_need': 'तुम्हाला आवश्यक असलेली प्रत्येक गोष्ट',
    'create_amazing_events': 'अप्रतिम इव्हेंट तयार करा',
    'features_description': 'शक्तिशाली वैशिष्ट्ये जी इव्हेंट प्लॅनिंग सोपी, कार्यक्षम आणि आनंददायक बनवतात',
    'ready_to_create': 'तुमचा पुढील इव्हेंट तयार करण्यासाठी सज्ज आहात?',
    'join_thousands': 'हजारो इव्हेंट आयोजकांसह सामील व्हा जे जॉयनेस्टवर विश्वास ठेवतात',
    'create_first_event': 'तुमचा पहिला इव्हेंट तयार करा',
    
    // Features
    'ai_assistant': 'एआय इव्हेंट असिस्टंट',
    'ai_assistant_desc': 'प्रगत एआय तंत्रज्ञानाद्वारे समर्थित वैयक्तिक इव्हेंट प्लॅनिंग सूचना मिळवा.',
    'vendor_network': 'विक्रेता नेटवर्क',
    'vendor_network_desc': 'केटरिंग, फोटोग्राफी, वेन्यू आणि अधिकसाठी 1000+ प्रमाणित विक्रेत्यांशी कनेक्ट व्हा.',
    'smart_invitations': 'स्मार्ट आमंत्रण',
    'smart_invitations_desc': 'रिअल-टाइम आरएसव्हीपी ट्रॅकिंग आणि अॅनालिटिक्ससह सुंदर डिजिटल आमंत्रणे तयार करा.',
    'event_analytics': 'इव्हेंट अॅनालिटिक्स',
    'event_analytics_desc': 'तपशीलवार अंतर्दृष्टी आणि कृती करण्यायोग्य डेटासह तुमच्या इव्हेंटच्या कामगिरीचा मागोवा घ्या.',
    
    // Auth Pages
    'welcome_back': 'पुन्हा स्वागत आहे',
    'sign_in_account': 'तुमच्या जॉयनेस्ट खात्यात साइन इन करा',
    'email_username': 'ईमेल किंवा यूजरनेम',
    'password': 'पासवर्ड',
    'forgot_password': 'पासवर्ड विसरलात?',
    'no_account': 'खाते नाही?',
    'register_here': 'येथे नोंदणी करा',
    'back': 'मागे',
    
    // Role Selection
    'join_joynest': 'जॉयनेस्टशी सामील व्हा',
    'choose_role': 'तुम्हाला आमचे प्लॅटफॉर्म कसे वापरायचे आहे ते निवडा',
    'event_planner': 'इव्हेंट प्लॅनर',
    'event_planner_desc': 'मला इव्हेंट प्लॅन करायचे आहेत, आमंत्रणे व्यवस्थापित करायची आहेत आणि विक्रेते बुक करायचे आहेत',
    'vendor': 'विक्रेता',
    'vendor_desc': 'मी इव्हेंट सेवा प्रदान करतो आणि क्लायंटशी कनेक्ट करू इच्छितो',
    'continue_as_user': 'यूजर म्हणून सुरू ठेवा',
    'continue_as_vendor': 'विक्रेता म्हणून सुरू ठेवा',
    'already_have_account': 'आधीपासून खाते आहे?',
    'sign_in_here': 'येथे साइन इन करा',
    
    // Registration
    'create_user_account': 'यूजर खाते तयार करा',
    'join_as_planner': 'जॉयनेस्टमध्ये इव्हेंट प्लॅनर म्हणून सामील व्हा',
    'full_name': 'पूर्ण नाव',
    'email_address': 'ईमेल पत्ता',
    'phone_number': 'फोन नंबर',
    'username': 'यूजरनेम',
    'create_password': 'पासवर्ड तयार करा',
    'create_account': 'खाते तयार करा',
    'back_to_role': 'भूमिका निवडीवर परत',
    
    // Vendor Registration
    'vendor_registration': 'विक्रेता नोंदणी',
    'join_vendor_network': 'व्यावसायिक इव्हेंट विक्रेत्यांच्या आमच्या नेटवर्कमध्ये सामील व्हा',
    'business_name': 'व्यवसायाचे नाव',
    'service_category': 'सेवा श्रेणी',
    'select_service': 'तुमची सेवा निवडा',
    'catering': 'केटरिंग',
    'photography': 'फोटोग्राफी',
    'venue': 'वेन्यू',
    'decoration': 'सजावट',
    'entertainment': 'मनोरंजन',
    'audio_visual': 'ऑडिओ व्हिज्युअल',
    'designer': 'डिझायनर',
    'budget_min': 'बजेट किमान (₹)',
    'budget_max': 'बजेट कमाल (₹)',
    'contact_phone': 'संपर्क फोन',
    'description': 'वर्णन',
    'register_as_vendor': 'विक्रेता म्हणून नोंदणी करा',
    
    // Dashboard
    'welcome': 'स्वागत आहे',
    'plan_organize': 'आमच्या एआय-पॉवर्ड साधनांसह परफेक्ट इव्हेंटची योजना करा, व्यवस्थापित करा आणि अंमलात आणा',
    'active_events': 'सक्रिय इव्हेंट',
    'invitations': 'आमंत्रणे',
    'notes': 'नोट्स',
    'upcoming': 'आगामी',
    'ai_assistant_tab': 'एआय असिस्टंट',
    'create_event_tab': 'इव्हेंट तयार करा',
    'find_vendors_tab': 'विक्रेते शोधा',
    'my_events_tab': 'माझे इव्हेंट',
    'invitations_tab': 'आमंत्रणे',
    'describe_event': 'तुमच्या इव्हेंटचे वर्णन करा (प्रकार, पाहुणे, बजेट, इ.) आणि मी विक्रेता शिफारशींसह संपूर्ण योजना तयार करेन.',
    'send': 'पाठवा',
    'create_new_event': 'नवीन इव्हेंट तयार करा',
    'start_planning': 'तुमचा पुढील परफेक्ट इव्हेंट प्लॅन करणे सुरू करा',
    'browse_vendors': 'विक्रेते ब्राउझ करा',
    'no_events': 'अद्याप कोणतेही इव्हेंट तयार केलेले नाहीत. तुमचा पहिला इव्हेंट तयार करा!',
    'no_invitations': 'अद्याप कोणतेही आमंत्रण तयार केलेले नाही. तुमचे पहिले आमंत्रण तयार करा!',
    
    // Invitation Modal
    'premium_designer': 'प्रीमियम आमंत्रण डिझायनर',
    'create_stunning': '15 टेम्पलेट्स, कस्टम फॉन्ट आणि कलर कंट्रोलसह आकर्षक आमंत्रणे तयार करा',
    'basic_info': 'मूलभूत माहिती',
    'event_type': 'इव्हेंट प्रकार',
    'wedding': 'लग्न',
    'engagement': 'साखरपुडा',
    'birthday': 'वाढदिवस',
    'anniversary': 'वर्धापन दिन',
    'corporate': 'कॉर्पोरेट इव्हेंट',
    'baby_shower': 'बेबी शॉवर',
    'graduation': 'पदवीदान',
    'housewarming': 'गृहप्रवेश',
    'primary_name': 'मुख्य नाव',
    'secondary_name': 'दुय्यम नाव',
    'tagline': 'टॅगलाइन / वर्णन',
    'date': 'तारीख',
    'time': 'वेळ',
    'venue_name': 'स्थळाचे नाव',
    'address': 'पत्ता',
    'add_photo': 'फोटो जोडा (पर्यायी)',
    'choose_template': 'डिझाइन टेम्पलेट निवडा',
    'font_style': 'फॉन्ट शैली',
    'color_custom': 'रंग सानुकूलन',
    'font_color': 'फॉन्ट रंग',
    'accent_color': 'एक्सेंट रंग',
    'custom_color': 'सानुकूल रंग',
    'live_preview': 'लाइव्ह प्रीव्ह्यू',
    'download_png': 'पीएनजी',
    'download_pdf': 'पीडीएफ',
    'share': 'शेअर करा',
    'save': 'सेव्ह करा'
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('joynest_language', langCode);
  };

  // Load saved language on initial render
  React.useEffect(() => {
    const savedLang = localStorage.getItem('joynest_language');
    if (savedLang && ['en', 'hi', 'mr'].includes(savedLang)) {
      setCurrentLanguage(savedLang);
    }
  }, []);

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      changeLanguage, 
      t,
      languages 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};