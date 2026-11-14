(() => {
'use strict';
const LS_SETS = {"instruments":{"z":1,"d":[],"e":"9|Guitar|Guitare|str\n9|Piano||key\n8|Drums/Drum kit/Drum|Batterie/Tambour|perc\n8|Violin|Violon|str\n7|Flute|Flûte|wind\n7|Trumpet|Trompette|wind\n7|Saxophone/Sax|Saxophone/Saxo|wind\n6|Cello|Violoncelle|str\n6|Harp|Harpe|str\n6|Clarinet|Clarinette|wind\n6|Bass guitar/Bass|Basse/Guitare basse|str\n6|Ukulele|Ukulélé|str\n6|Electric guitar|Guitare électrique|str\n5|Trombone||wind\n5|Accordion|Accordéon|key\n5|Harmonica||wind\n5|Xylophone||perc\n5|Tuba||wind\n5|Recorder|Flûte à bec|wind\n5|Banjo||str\n5|Viola|Alto|str\n5|Double bass/Contrabass|Contrebasse|str\n5|Organ|Orgue|key\n5|Keyboard/Synthesizer/Synth|Clavier/Synthétiseur|key\n5|Tambourine|Tambourin|perc\n5|Triangle||perc\n5|French horn/Horn|Cor/Cor d'harmonie|wind\n5|Oboe|Hautbois|wind\n5|Bagpipes|Cornemuse|wind\n4|Bassoon|Basson|wind\n4|Mandolin|Mandoline|str\n4|Harpsichord|Clavecin|key\n4|Cymbals|Cymbales|perc\n4|Maracas||perc\n4|Bongo/Bongos|Bongos|perc\n4|Djembe|Djembé|perc\n4|Castanets|Castagnettes|perc\n4|Sitar||str\n4|Didgeridoo||wind\n4|Glockenspiel||perc\n4|Marimba||perc\n4|Timpani/Kettle drum|Timbales|perc\n4|Snare drum|Caisse claire|perc\n4|Bass drum|Grosse caisse|perc\n4|Cornet||wind\n4|Piccolo||wind\n4|Lute|Luth|str\n4|Lyre||str\n4|Pan flute/Panpipes|Flûte de Pan|wind\n4|Ocarina||wind\n4|Kazoo||wind\n4|Steel drum/Steelpan||perc\n4|Cajón/Cajon|Cajón|perc\n4|Gong||perc\n4|Bell/Bells|Cloche/Cloches|perc\n4|Tubular bells|Cloches tubulaires|perc\n4|Celesta|Célesta|key\n4|Theremin|Thérémine|key\n4|Melodica|Mélodica|key\n3|Koto||str\n3|Shamisen||str\n3|Erhu||str\n3|Guzheng||str\n3|Pipa||str\n3|Tabla||perc\n3|Sarod||str\n3|Veena||str\n3|Oud||str\n3|Bouzouki||str\n3|Balalaika|Balalaïka|str\n3|Zither|Cithare|str\n3|Dulcimer|Dulcimer/Tympanon|str\n3|Hurdy-gurdy|Vielle à roue|str\n3|Kora||str\n3|Charango||str\n3|Kalimba/Thumb piano|Kalimba/Sanza|perc\n3|Mbira||perc\n3|Talking drum|Tambour d'aisselle|perc\n3|Congas/Conga|Congas|perc\n3|Timbal/Latin timbales|Timbales latines|perc\n3|Güiro/Guiro|Güiro|perc\n3|Cowbell|Cloche à vache|perc\n3|Washboard|Planche à laver|perc\n3|Spoons|Cuillères|perc\n3|Hang/Handpan|Handpan/Hang|perc\n3|Vibraphone||perc\n3|Euphonium||wind\n3|Flugelhorn||wind\n3|Sousaphone||wind\n3|Cor anglais/English horn|Cor anglais|wind\n3|Contrabassoon|Contrebasson|wind\n3|Bass clarinet|Clarinette basse|wind\n3|Shakuhachi||wind\n3|Tin whistle/Penny whistle|Flageolet/Tin whistle|wind\n3|Bugle|Clairon|wind\n3|Alphorn|Cor des Alpes|wind\n3|Shofar||wind\n3|Conch/Conch shell|Conque|wind\n3|Bandoneon|Bandonéon|key\n3|Concertina||key\n3|Harmonium||key\n3|Clavichord|Clavicorde|key\n3|Electric piano/Rhodes|Piano électrique|key\n3|Grand piano|Piano à queue|key\n3|Upright piano|Piano droit|key\n3|Acoustic guitar|Guitare acoustique|str\n3|Classical guitar|Guitare classique|str\n3|Twelve-string guitar|Guitare douze cordes|str\n3|Pedal steel guitar/Steel guitar|Guitare steel|str\n3|Fiddle|Violon traditionnel|str\n3|Viola da gamba|Viole de gambe|str\n3|Bodhrán/Bodhran|Bodhrán|perc\n3|Rainstick|Bâton de pluie|perc\n3|Jaw harp/Jew's harp|Guimbarde|wind\n2|Duduk|Doudouk|wind\n2|Zurna||wind\n2|Gaida|Gaïda|wind\n2|Uilleann pipes||wind\n2|Biniou||wind\n2|Bombarde||wind\n2|Galoubet||wind\n2|Serpent||wind\n2|Ophicleide|Ophicléide|wind\n2|Sackbut|Saqueboute|wind\n2|Crumhorn|Cromorne|wind\n2|Glass harmonica|Harmonica de verre|perc\n2|Waterphone||perc\n2|Turntables/Turntable|Platines|no\n0|Voice|Voix|no\n0|Microphone|Micro/Microphone|no\n0|Speaker|Enceinte|no"},"genres":{"z":1,"d":["music","musique"],"e":"9|Pop||\n9|Rock||\n9|Rap/Hip hop/Hip-hop|Rap/Hip-hop|\n8|Jazz||\n7|Classical/Classical music|Classique/Musique classique|\n7|Country||\n7|Reggae||\n7|Electronic/Electro/EDM|Électro/Électronique/EDM|\n6|Metal/Heavy metal|Métal/Heavy metal|\n6|Blues||\n6|R&B/Rhythm and blues|R'n'B/RnB|\n6|Techno||\n6|House||\n5|Punk||\n5|Disco||\n5|Funk||\n5|Soul||\n5|Rock and roll/Rock 'n' roll|Rock'n'roll|\n5|Opera|Opéra|\n5|K-pop||\n5|Reggaeton||\n5|Salsa||\n5|Gospel||\n5|Folk||\n5|Indie|Indie/Indé|\n5|Dubstep||\n5|Trap||\n4|Drill||\n3|Grime||\n4|Afrobeat/Afrobeats|Afrobeat|\n3|Ska||\n3|Grunge||\n3|Emo||\n4|Lo-fi||\n3|Drum and bass/DnB|Drum and bass|\n3|Trance||\n2|Ambient||\n3|J-pop||\n3|Bossa nova||\n3|Samba||\n3|Flamenco||\n3|Tango||\n3|Zouk||\n2|Kompa||\n3|Raï||\n3|Chanson/French chanson|Chanson française/Variété française|\n3|Swing||\n2|Bebop||\n3|Bluegrass||\n3|Motown||\n3|Synthwave||\n3|Hard rock||\n3|Death metal||\n2|Black metal||\n2|Thrash metal||\n3|Pop rock||\n2|Soft rock||\n3|Alternative/Alternative rock|Rock alternatif/Alternatif|\n2|Progressive rock/Prog|Rock progressif|\n2|Psychedelic rock|Rock psychédélique|\n2|New wave||\n2|Post-punk||\n2|Shoegaze||\n2|Garage||\n2|UK garage||\n3|Hardstyle||\n2|Hardcore||\n2|Breakbeat||\n2|Jungle||\n2|Electro swing|Électro swing|\n2|Chiptune||\n3|Phonk||\n2|Hyperpop||\n3|Amapiano||\n3|Dancehall||\n3|Calypso||\n2|Soca||\n2|Cumbia||\n3|Bachata||\n2|Merengue||\n3|Mariachi||\n2|Fado||\n2|Klezmer||\n3|Celtic|Celtique|\n3|Baroque||\n3|Gregorian chant|Chant grégorien|\n2|Barbershop||\n3|A cappella||\n3|Musical theatre/Musicals|Comédie musicale|\n3|Film score/Soundtrack|Musique de film/Bande originale|\n2|Doo-wop||\n2|Rockabilly||\n2|Surf rock||\n3|Britpop||\n2|Eurodance||\n2|Italo disco||\n2|French touch||\n2|Trip hop||\n2|Acid jazz||\n2|Jazz fusion||\n2|Smooth jazz||\n2|Dub||\n2|Bhangra||\n2|Qawwali|Qawwalî|\n2|Gamelan||\n2|Enka||\n2|Mandopop/C-pop|Mandopop|\n2|Afropop||\n2|Highlife||\n2|Coupé-décalé||\n2|Ndombolo||\n2|Gnawa|Gnaoua|\n3|Polka||\n3|Waltz|Valse|\n2|Musette||\n2|Yodel|Yodel/Tyrolienne|\n2|Grindcore||\n2|Nu metal||\n2|Metalcore||\n2|Emo rap||\n2|Cloud rap||\n3|Gangsta rap||\n2|Boom bap||\n2|Neo soul|Néo-soul|\n2|New jack swing||\n0|Loud|Fort|no\n0|Music|Musique|no\n0|Song||no"},"dances":{"z":1,"d":["dance","danse"],"e":"8|Ballet|Ballet/Danse classique|\n8|Salsa||\n7|Tango||\n7|Waltz|Valse|\n7|Hip hop/Hip-hop|Hip-hop|\n7|Breakdance/Breaking||\n6|Tap dance/Tap|Claquettes|\n6|Flamenco||\n6|Samba||\n6|Cha-cha/Cha-cha-cha|Cha-cha-cha|\n6|Disco||\n6|Macarena||\n6|Floss||\n4|Rumba||\n4|Foxtrot|Fox-trot|\n4|Jive||\n4|Swing||\n4|Twist||\n4|Moonwalk||\n4|Dab||\n4|Belly dance|Danse du ventre|\n4|Contemporary/Contemporary dance|Danse contemporaine/Contemporain|\n3|Jazz dance/Modern jazz|Modern jazz/Danse jazz|\n3|Line dance/Line dancing|Line dance/Danse en ligne|\n4|Bachata||\n3|Merengue||\n4|Zumba||\n3|Kizomba||\n3|Lindy hop||\n4|Charleston||\n3|Quickstep||\n3|Paso doble||\n4|Polka||\n4|Can-can/Cancan|French cancan/Cancan|\n4|Rock and roll/Rock'n'roll|Rock|\n4|Haka||\n4|Hula||\n3|Limbo||\n3|Conga||\n3|Mambo||\n3|Lambada||\n3|Krump||\n3|Popping||\n2|Locking||\n3|Voguing/Vogue|Voguing|\n3|Twerk/Twerking|Twerk|\n3|Shuffle||\n3|Tecktonik/Electro dance|Tecktonik|\n3|Square dance||\n3|Irish dance/Irish dancing/Riverdance|Danse irlandaise|\n2|Highland dance|Danse des Highlands|\n2|Morris dance|Danse morris|\n2|Clog dance/Clogging|Danse en sabots|\n3|Bollywood/Bollywood dance|Danse Bollywood|\n2|Bharatanatyam||\n2|Kathak||\n4|Capoeira||\n2|Forró||\n2|Cumbia||\n2|Reggaeton||\n2|Dancehall||\n2|Afro dance/Afrobeats dance|Afro dance|\n2|Azonto||\n2|Coupé-décalé||\n3|Sirtaki||\n2|Hora||\n2|Kazachok/Cossack dance|Danse cosaque|\n2|Bourrée||\n3|Farandole||\n2|Gavotte||\n3|Minuet|Menuet|\n2|Quadrille||\n2|Mazurka||\n2|Polonaise||\n3|Tarantella|Tarentelle|\n2|Fandango||\n2|Sardana|Sardane|\n3|Bolero|Boléro|\n2|Pole dance||\n3|Ballroom|Danse de salon|\n2|Folk dance|Danse folklorique|\n4|Gangnam Style||\n2|Harlem shake||\n3|Chicken dance|Danse des canards|\n3|Robot||\n2|Running man||\n3|Worm|Chenille|\n2|Electric slide||\n2|Hustle||\n2|Jitterbug||\n2|Boogie-woogie||\n2|Madison||\n2|Zouk||\n3|Lion dance|Danse du lion|\n3|Dragon dance|Danse du dragon|\n0|Party|Fête|no\n0|Music|Musique|no"},"sports":{"z":1,"d":[],"e":"9|Football/Soccer|Football/Foot|ball oly\n9|Basketball|Basket/Basket-ball|ball oly\n8|Tennis||ball oly\n8|Swimming|Natation|oly\n8|Rugby||ball oly\n7|Volleyball|Volley/Volley-ball|ball oly\n7|Baseball||ball oly\n7|Golf||ball oly\n7|Cricket||ball\n7|Boxing|Boxe|oly\n7|Cycling|Cyclisme/Vélo|oly\n7|Athletics/Track and field|Athlétisme|oly\n7|Ice hockey/Hockey|Hockey sur glace/Hockey|oly\n6|American football|Football américain|ball\n6|Handball||ball oly\n6|Table tennis/Ping pong|Tennis de table/Ping-pong|ball oly\n6|Badminton||oly\n6|Gymnastics|Gymnastique|oly\n6|Skiing|Ski|oly\n6|Judo||oly\n6|Karate|Karaté|oly\n6|Surfing|Surf|oly\n6|Skateboarding|Skateboard/Skate|oly\n6|Snowboarding|Snowboard|oly\n6|Running|Course à pied|\n6|Horse riding/Equestrian|Équitation|oly\n6|Fencing|Escrime|oly\n3|Field hockey|Hockey sur gazon|ball oly\n3|Water polo|Water-polo|ball oly\n4|Rowing|Aviron|oly\n3|Canoeing/Kayaking|Canoë/Kayak/Canoë-kayak|oly\n4|Sailing|Voile|oly\n4|Diving|Plongeon|oly\n4|Archery|Tir à l'arc|oly\n3|Shooting|Tir|oly\n3|Weightlifting|Haltérophilie|oly\n4|Wrestling|Lutte|oly\n4|Taekwondo||oly\n4|Triathlon||oly\n4|Climbing/Rock climbing/Bouldering|Escalade|oly\n4|Ice skating/Figure skating|Patinage/Patinage artistique|oly\n3|Speed skating|Patinage de vitesse|oly\n4|Bobsleigh/Bobsled|Bobsleigh|oly\n4|Curling||oly\n3|Biathlon||oly\n2|Luge||oly\n3|Ski jumping|Saut à ski|oly\n3|Pentathlon/Modern pentathlon|Pentathlon moderne|oly\n3|Decathlon|Décathlon|oly\n4|Marathon||oly\n3|Breaking/Breakdancing|Breaking|oly\n4|BMX||oly\n4|Mountain biking|VTT|oly\n5|Formula 1/F1/Motor racing|Formule 1/F1/Course automobile|\n5|MMA/Mixed martial arts|MMA/Arts martiaux mixtes|\n4|Kickboxing||\n3|Muay Thai/Thai boxing|Muay-thaï/Boxe thaï|\n4|Sumo||\n4|Kung fu|Kung-fu|\n3|Aikido|Aïkido|\n3|Jiu-jitsu/Brazilian jiu-jitsu|Jiu-jitsu|\n4|Bowling||ball\n4|Darts|Fléchettes|\n3|Snooker||ball\n4|Billiards/Pool|Billard|ball\n4|Squash||ball\n4|Padel||ball\n3|Pickleball||ball\n3|Softball||ball oly\n2|Lacrosse|Crosse|ball\n2|Netball||ball\n4|Dodgeball|Balle aux prisonniers|ball\n2|Kickball||ball\n2|Gaelic football|Football gaélique|ball\n2|Hurling||ball\n3|Australian rules football/Aussie rules/AFL|Football australien|ball\n2|Polo||ball\n3|Water skiing|Ski nautique|\n3|Wakeboarding|Wakeboard|\n3|Kitesurfing|Kitesurf|\n3|Windsurfing|Planche à voile|oly\n3|Paragliding|Parapente|\n3|Skydiving|Parachutisme|\n3|Bungee jumping|Saut à l'élastique|\n4|Motocross||\n3|Rally|Rallye|\n4|Karting||\n3|NASCAR||\n3|Horse racing|Course hippique|\n3|Show jumping|Saut d'obstacles|oly\n3|Dressage||oly\n4|Hiking|Randonnée|\n3|Mountaineering|Alpinisme|\n2|Orienteering|Course d'orientation|\n4|Parkour||\n3|Cheerleading|Pom-pom girls/Cheerleading|\n3|Trampoline||oly\n3|Rhythmic gymnastics|Gymnastique rythmique|oly\n3|Synchronised swimming/Artistic swimming|Natation artistique/Natation synchronisée|oly\n4|Pétanque/Boules||ball\n2|Bocce||ball\n2|Croquet||ball\n4|Frisbee/Ultimate/Ultimate frisbee|Ultimate/Frisbee|\n2|Sepak takraw||ball\n2|Kabaddi||\n2|Pelota/Basque pelota|Pelote basque|ball\n2|Teqball||ball\n4|Futsal||ball\n4|Beach volleyball|Beach-volley|ball oly\n3|Rugby league|Rugby à XIII/Rugby à 13|ball\n3|Rugby sevens|Rugby à sept|ball oly\n3|Sprint||oly\n3|Long jump|Saut en longueur|oly\n3|High jump|Saut en hauteur|oly\n3|Pole vault|Saut à la perche|oly\n3|Triple jump|Triple saut|oly\n3|Javelin|Lancer du javelot/Javelot|oly\n3|Discus|Lancer du disque/Disque|oly\n3|Shot put|Lancer du poids|oly\n3|Hammer throw|Lancer du marteau|oly\n3|Hurdles|Haies|oly\n3|Relay|Relais|oly\n2|Race walking|Marche athlétique|oly\n4|Esports/E-sports|E-sport|\n4|Chess|Échecs|\n3|Arm wrestling|Bras de fer|\n3|Tug of war|Tir à la corde|\n2|Jousting|Joute|\n2|Rodeo|Rodéo|\n2|Bullfighting|Corrida|\n3|Cross-country skiing|Ski de fond|oly\n3|Alpine skiing|Ski alpin|oly\n3|Freestyle skiing|Ski acrobatique|oly\n3|Ice climbing|Escalade sur glace|\n2|Skeleton||oly\n2|Bandy||\n2|Floorball||\n2|Roller derby||\n3|Roller skating|Roller|\n3|Inline hockey/Roller hockey|Roller hockey|\n2|Spearfishing|Chasse sous-marine|\n4|Fishing|Pêche|\n2|Powerlifting|Force athlétique|\n3|Bodybuilding|Culturisme/Bodybuilding|\n3|CrossFit||\n4|Yoga||\n3|Pilates||\n2|Calisthenics|Callisthénie/Street workout|\n2|Sambo||\n2|Savate/French boxing|Savate/Boxe française|\n3|Capoeira||\n2|Kendo||\n2|Wushu||\n0|Walking|Marche|no\n0|Ball|Ballon|no\n0|Sport||no\n0|Dance|Danse|no"},"jobs":{"z":1,"d":[],"e":"9|Doctor|Médecin/Docteur|\n9|Teacher|Professeur/Enseignant/Prof|\n8|Police officer/Policeman/Cop|Policier/Gendarme|\n8|Firefighter/Fireman|Pompier|\n8|Nurse|Infirmier/Infirmière|\n7|Chef/Cook|Chef/Cuisinier|\n7|Lawyer|Avocat|\n7|Engineer|Ingénieur|\n7|Farmer|Agriculteur/Fermier|\n7|Pilot|Pilote|\n7|Astronaut|Astronaute|\n7|Dentist|Dentiste|\n7|Vet/Veterinarian|Vétérinaire|\n6|Actor/Actress|Acteur/Actrice/Comédien|\n6|Singer|Chanteur/Chanteuse|\n6|Artist|Artiste|\n6|Scientist|Scientifique|\n6|Builder|Maçon/Ouvrier du bâtiment|\n6|Baker|Boulanger|\n6|Butcher|Boucher|\n6|Plumber|Plombier|\n6|Electrician|Électricien|\n6|Mechanic|Mécanicien/Garagiste|\n6|Carpenter|Charpentier/Menuisier|\n6|Hairdresser/Barber|Coiffeur/Barbier|\n6|Waiter/Waitress|Serveur/Serveuse|\n6|Soldier|Soldat/Militaire|\n5|Footballer/Football player|Footballeur|\n6|Youtuber/YouTuber|Youtubeur|\n6|Streamer||\n6|Programmer/Developer/Software developer|Programmeur/Développeur|\n6|Journalist|Journaliste|\n6|Architect|Architecte|\n6|Accountant|Comptable|\n6|Cashier|Caissier/Caissière|\n6|Postman/Mail carrier/Postal worker|Facteur|\n6|Taxi driver|Chauffeur de taxi|\n6|Bus driver|Chauffeur de bus|\n6|Truck driver/Lorry driver|Chauffeur routier/Routier|\n6|Lifeguard|Maître-nageur/Sauveteur|\n4|Pharmacist|Pharmacien|\n4|Surgeon|Chirurgien|\n4|Psychologist|Psychologue|\n4|Photographer|Photographe|\n4|Musician|Musicien|\n3|Dancer|Danseur/Danseuse|\n4|Writer/Author|Écrivain/Auteur|\n4|Painter|Peintre|\n4|Designer||\n3|Fashion designer|Styliste/Créateur de mode|\n4|Model|Mannequin|\n4|Judge|Juge|\n3|Politician|Homme politique/Politicien|\n4|President|Président|\n4|Mayor|Maire|\n4|Banker|Banquier|\n4|Shopkeeper|Commerçant|\n3|Salesperson/Salesman|Vendeur/Vendeuse|\n4|Secretary|Secrétaire|\n3|Receptionist|Réceptionniste|\n4|Librarian|Bibliothécaire|\n3|Cleaner/Janitor|Agent d'entretien/Concierge|\n4|Gardener|Jardinier|\n4|Fisherman|Pêcheur|\n3|Miner|Mineur|\n4|Sailor|Marin/Matelot|\n3|Captain|Capitaine|\n3|Flight attendant/Air hostess|Hôtesse de l'air/Steward|\n3|Air traffic controller|Contrôleur aérien|\n3|Train driver|Conducteur de train|\n3|Delivery driver|Livreur|\n3|Security guard|Agent de sécurité/Vigile|\n4|Detective|Détective|\n4|Spy|Espion|\n3|Paramedic|Ambulancier|\n3|Midwife|Sage-femme|\n3|Optician|Opticien|\n3|Physiotherapist|Kinésithérapeute/Kiné|\n3|Babysitter/Nanny|Baby-sitter/Nounou|\n4|Coach|Entraîneur/Coach|\n4|Referee|Arbitre|\n3|Athlete|Athlète|\n3|Tennis player|Joueur de tennis|\n3|Jockey||\n3|Professor|Professeur d'université|\n3|Headteacher/Principal|Directeur d'école/Proviseur|\n3|Translator/Interpreter|Traducteur/Interprète|\n3|Tour guide|Guide touristique|\n3|Manager|Manager/Directeur|\n3|CEO/Boss|PDG/Patron|\n3|Entrepreneur||\n4|Influencer|Influenceur/Influenceuse|\n3|Gamer/Pro gamer|Joueur professionnel|\n4|DJ||\n4|Rapper|Rappeur|\n3|Comedian|Humoriste|\n4|Magician|Magicien|\n4|Clown||\n3|Film director/Director|Réalisateur|\n3|Producer|Producteur|\n3|Cameraman|Caméraman|\n3|Animator|Animateur|\n3|Illustrator|Illustrateur|\n3|Graphic designer|Graphiste|\n3|Web designer|Webdesigner|\n3|Data scientist||\n3|Mathematician|Mathématicien|\n3|Physicist|Physicien|\n3|Chemist|Chimiste|\n3|Biologist|Biologiste|\n3|Astronomer|Astronome|\n3|Archaeologist|Archéologue|\n3|Historian|Historien|\n3|Geologist|Géologue|\n3|Meteorologist/Weather forecaster|Météorologue/Présentateur météo|\n3|Economist|Économiste|\n3|Philosopher|Philosophe|\n3|Priest|Prêtre/Curé|\n3|Monk|Moine|\n3|Nun|Religieuse/Bonne sœur|\n3|Imam||\n3|Rabbi|Rabbin|\n3|Tailor|Tailleur/Couturier|\n3|Shoemaker/Cobbler|Cordonnier|\n3|Jeweller/Jeweler|Bijoutier|\n3|Watchmaker|Horloger|\n3|Blacksmith|Forgeron|\n3|Locksmith|Serrurier|\n3|Glazier|Vitrier|\n3|Roofer|Couvreur|\n3|Painter and decorator/Decorator|Peintre en bâtiment|\n3|Welder|Soudeur|\n3|Bricklayer|Briqueteur|\n3|Tiler|Carreleur|\n3|Florist|Fleuriste|\n3|Pastry chef|Pâtissier|\n3|Chocolatier||\n3|Cheesemaker|Fromager|\n3|Fishmonger|Poissonnier|\n3|Greengrocer|Primeur/Marchand de fruits et légumes|\n3|Grocer|Épicier|\n3|Barista||\n3|Courier|Coursier|\n3|Warehouse worker|Magasinier|\n3|Factory worker|Ouvrier/Ouvrière|\n3|Beekeeper|Apiculteur|\n3|Shepherd|Berger|\n3|Forester/Lumberjack|Bûcheron/Forestier|\n3|Park ranger|Garde forestier|\n3|Zookeeper|Soigneur animalier/Gardien de zoo|\n3|Dog walker|Promeneur de chiens|\n3|Groomer|Toiletteur|\n3|Social worker|Assistant social/Travailleur social|\n3|Counsellor/Counselor|Conseiller|\n3|Therapist|Thérapeute|\n3|Optometrist|Optométriste|\n3|Radiologist|Radiologue|\n3|Dermatologist|Dermatologue|\n3|Cardiologist|Cardiologue|\n3|Paediatrician/Pediatrician|Pédiatre|\n3|Psychiatrist|Psychiatre|\n3|Orthodontist|Orthodontiste|\n3|Speech therapist|Orthophoniste|\n3|Diplomat|Diplomate|\n3|Ambassador|Ambassadeur|\n3|Civil servant|Fonctionnaire|\n3|Customs officer|Douanier|\n3|Prison guard|Gardien de prison|\n3|Bailiff|Huissier|\n3|Notary|Notaire|\n3|Estate agent/Real estate agent|Agent immobilier|\n3|Insurance agent|Assureur|\n3|Stockbroker/Trader|Trader/Courtier|\n3|Auditor|Auditeur|\n3|Consultant||\n3|Recruiter|Recruteur|\n3|Teacher's assistant/Teaching assistant|Assistant d'éducation|\n3|Lecturer|Maître de conférences|\n3|Surveyor|Géomètre|\n3|Urban planner|Urbaniste|\n3|Stuntman/Stunt performer|Cascadeur|\n3|Acrobat|Acrobate|\n3|Juggler|Jongleur|\n3|Puppeteer|Marionnettiste|\n3|Ventriloquist|Ventriloque|\n3|Sculptor|Sculpteur|\n3|Potter|Potier|\n3|Composer|Compositeur|\n3|Conductor|Chef d'orchestre|\n3|Sound engineer|Ingénieur du son|\n3|Make-up artist|Maquilleur|\n3|Tattoo artist|Tatoueur|\n0|Student|Étudiant/Élève|no\n0|Unemployed|Chômeur|no\n0|Retired|Retraité|no\n0|Parent/Mum/Dad|Parent|no\n0|Kid/Child|Enfant|no"},"clothing":{"z":1,"d":[],"e":"9|T-shirt/Tee|T-shirt/Tee-shirt|\n8|Trousers/Pants|Pantalon|\n8|Jeans|Jean|\n8|Dress|Robe|\n8|Shoes/Shoe|Chaussures/Chaussure|\n7|Shirt|Chemise|\n7|Skirt|Jupe|\n7|Jacket|Veste/Blouson|\n7|Coat|Manteau|\n7|Hat|Chapeau|\n7|Socks/Sock|Chaussettes/Chaussette|\n7|Jumper/Sweater/Pullover|Pull/Pull-over|\n7|Hoodie|Sweat à capuche/Hoodie|\n6|Shorts|Short|\n6|Scarf|Écharpe/Foulard|\n6|Gloves/Glove|Gants/Gant|\n6|Cap/Baseball cap|Casquette|\n6|Boots/Boot|Bottes/Botte|\n6|Trainers/Sneakers|Baskets/Sneakers|\n6|Tie|Cravate|\n6|Suit|Costume|\n6|Pyjamas/Pajamas|Pyjama|\n6|Belt|Ceinture|\n6|Sandals/Sandal|Sandales/Sandale|\n6|Flip-flops/Thongs|Tongs|\n6|Swimsuit/Swimming costume/Bathing suit|Maillot de bain|\n5|Bikini||\n4|Blouse|Chemisier/Blouse|\n4|Cardigan|Cardigan/Gilet|\n4|Tank top/Vest top|Débardeur|\n4|Polo shirt/Polo|Polo|\n4|Leggings|Leggings/Legging|\n4|Tights|Collants|\n4|Beanie/Woolly hat|Bonnet|\n4|Raincoat|Imperméable/Ciré|\n4|Parka||\n3|Anorak||\n3|Puffer jacket/Down jacket|Doudoune|\n4|Blazer||\n4|Tuxedo|Smoking|\n4|Bow tie|Nœud papillon|\n4|Jumpsuit|Combinaison|\n4|Overalls/Dungarees|Salopette|\n4|Tracksuit|Survêtement/Jogging|\n3|Joggers/Sweatpants|Pantalon de jogging|\n4|Sweatshirt|Sweat/Sweat-shirt|\n4|Turtleneck/Polo neck|Col roulé|\n4|Crop top||\n4|Uniform|Uniforme|\n4|Apron|Tablier|\n4|Dressing gown/Bathrobe|Peignoir/Robe de chambre|\n4|Slippers|Chaussons/Pantoufles|\n3|Nightgown/Nightie|Chemise de nuit|\n4|Bra|Soutien-gorge|\n3|Boxers/Boxer shorts|Caleçon/Boxer|\n4|Mittens|Moufles|\n3|Earmuffs|Cache-oreilles|\n3|Balaclava|Cagoule|\n4|Beret|Béret|\n3|Bowler hat|Chapeau melon|\n4|Top hat|Haut-de-forme|\n3|Cowboy hat|Chapeau de cowboy|\n4|Sombrero||\n3|Fedora|Fedora/Borsalino|\n3|Panama hat|Panama|\n3|Bucket hat|Bob|\n3|Headband|Bandeau|\n4|Helmet|Casque|\n3|Crown|Couronne|no\n3|Veil|Voile|\n4|Kimono||\n3|Sari||\n4|Kilt||\n4|Poncho||\n4|Cape||\n3|Cloak|Cape longue/Pèlerine|\n3|Toga|Toge|\n3|Tunic|Tunique|\n3|Kaftan|Caftan|\n3|Djellaba||\n3|Abaya||\n3|Hijab|Hijab/Foulard islamique|\n3|Turban||\n3|Kurta||\n3|Hanbok||\n3|Lederhosen|Lederhosen/Culotte de peau|\n3|Dirndl||\n3|Sarong|Paréo/Sarong|\n3|Leotard|Justaucorps|\n3|Tutu||\n3|Wetsuit|Combinaison de plongée|\n3|Ski suit|Combinaison de ski|\n3|Corset||\n3|Petticoat|Jupon|\n3|Stockings|Bas|\n3|Suspenders/Braces|Bretelles|\n3|Cufflinks|Boutons de manchette|\n3|Loafers|Mocassins|\n4|High heels/Heels|Talons/Talons hauts|\n3|Wellies/Wellington boots/Rain boots|Bottes de pluie/Bottes en caoutchouc|\n3|Clogs|Sabots|\n3|Espadrilles||\n3|Ballet flats|Ballerines|\n3|Crocs||\n3|Ugg boots/Uggs|Uggs|\n3|Trench coat|Trench|\n3|Duffle coat|Duffle-coat|\n3|Pea coat|Caban|\n3|Bodywarmer/Body warmer|Doudoune sans manches|\n3|Fleece|Polaire|\n3|Windbreaker|Coupe-vent|\n3|Hawaiian shirt|Chemise hawaïenne|\n3|Football shirt/Jersey|Maillot|\n3|Sports bra|Brassière|\n3|Cycling shorts|Cuissard|\n3|Bermuda shorts/Bermudas|Bermuda|\n3|Chinos|Chino|\n3|Cargo pants|Pantalon cargo|\n3|Culottes|Jupe-culotte|\n3|Miniskirt|Minijupe|\n3|Gown/Ball gown|Robe de bal|\n3|Wedding dress|Robe de mariée|\n3|Sundress|Robe d'été|\n3|Onesie|Grenouillère/Combinaison pyjama|\n3|Bib|Bavoir|\n0|Glasses/Sunglasses|Lunettes|no\n0|Watch|Montre|no\n0|Bag/Handbag|Sac|no\n0|Necklace|Collier|no\n0|Ring|Bague|no\n0|Earrings|Boucles d'oreilles|no\n0|Umbrella|Parapluie|no\n0|Clothes|Vêtements|no"},"dishes":{"z":1,"d":[],"e":"9|Pizza||it\n8|Lasagne/Lasagna|Lasagnes/Lasagne|it\n8|Spaghetti bolognese/Bolognese/Spag bol|Spaghetti bolognaise/Bolognaise|it\n7|Carbonara/Spaghetti carbonara||it\n7|Risotto||it\n5|Tiramisu||it\n6|Ravioli|Raviolis/Ravioli|it\n5|Gnocchi||it\n5|Minestrone||it\n5|Pesto pasta/Pasta al pesto|Pâtes au pesto|it\n5|Bruschetta||it\n5|Calzone||it\n5|Focaccia||it\n3|Osso buco/Ossobuco|Osso buco|it\n4|Polenta||it\n4|Arancini||it\n4|Caprese salad/Caprese|Salade caprese/Caprese|it\n2|Vitello tonnato||it\n2|Saltimbocca||it\n4|Carpaccio||it\n4|Cannelloni|Cannellonis/Cannelloni|it\n5|Tortellini||it\n3|Penne arrabbiata/Arrabbiata|Penne all'arrabbiata/Arrabbiata|it\n3|Cacio e pepe||it\n2|Amatriciana||it\n2|Puttanesca||it\n2|Aglio e olio||it\n3|Fettuccine Alfredo/Alfredo|Fettuccine Alfredo|it\n1|Panzanella||it\n1|Ribollita||it\n3|Parmigiana/Eggplant parmesan|Parmigiana/Aubergines à la parmesane|it\n1|Chicken parmesan/Chicken parm||it\n2|Piadina||it\n4|Panini||it\n2|Antipasto|Antipasti|it\n3|Prosciutto|Prosciutto/Jambon de Parme|it\n3|Salami||it\n2|Mortadella|Mortadelle|it\n1|Bresaola||it\n3|Gelato||it\n3|Cannoli||it\n3|Panna cotta||it\n4|Pasta|Pâtes|it\n4|Spaghetti||it\n4|Pizza Margherita/Margherita||it\n1|Stromboli||it\n2|Frittata||it\n1|Supplì||it\n2|Crostini||it\n2|Risotto alla milanese|Risotto à la milanaise|it\n2|Cotoletta alla milanese/Milanese|Escalope milanaise|it\n1|Bollito misto||it\n2|Porchetta||it\n1|Pasta e fagioli||it\n2|Spaghetti alle vongole/Vongole|Spaghetti aux palourdes/Vongole|it\n2|Tagliatelle al ragù/Ragù|Tagliatelles au ragù|it\n1|Zuppa inglese||it\n1|Pizza quattro formaggi/Four cheese pizza|Pizza quatre fromages|it\n1|Pizza Napoletana/Neapolitan pizza|Pizza napolitaine|it\n8|Croissant||fr\n8|Baguette||fr\n7|Crêpe||fr\n7|Quiche/Quiche lorraine||fr\n7|Ratatouille||fr\n6|Coq au vin||fr\n6|Beef bourguignon/Bœuf bourguignon|Bœuf bourguignon/Bourguignon|fr\n7|Croque-monsieur/Croque monsieur|Croque-monsieur|fr\n6|Escargots/Snails|Escargots|fr\n6|Foie gras||fr\n5|Bouillabaisse||fr\n6|Raclette||fr\n5|Fondue/Cheese fondue|Fondue/Fondue savoyarde|fr\n5|Tartiflette||fr\n5|Cassoulet||fr\n5|French onion soup/Onion soup|Soupe à l'oignon|fr\n4|Pot-au-feu||fr\n4|Blanquette de veau/Blanquette||fr\n4|Duck confit/Confit de canard|Confit de canard|fr\n3|Magret de canard/Magret||fr\n4|Steak frites|Steak frites/Steak-frites|fr\n4|Gratin dauphinois||fr\n4|Hachis parmentier||fr\n4|Choucroute/Sauerkraut|Choucroute/Choucroute garnie|fr\n4|Salade niçoise/Niçoise salad|Salade niçoise|fr\n3|Croque-madame||fr\n4|Galette/Buckwheat crêpe|Galette/Galette de sarrasin/Galette bretonne|fr\n4|Moules-frites/Moules marinières/Mussels|Moules-frites/Moules marinières|fr\n3|Quenelle||fr\n2|Andouillette||fr\n2|Tapenade||fr\n2|Pissaladière||fr\n2|Socca||fr\n2|Brandade|Brandade/Brandade de morue|fr\n3|Aligot||fr\n2|Truffade||fr\n2|Potée||fr\n1|Garbure||fr\n2|Piperade||fr\n2|Poulet basquaise/Basque chicken|Poulet basquaise|fr\n2|Daube||fr\n1|Navarin||fr\n1|Petit salé aux lentilles||fr\n1|Tête de veau||fr\n3|Pâté||fr\n3|Terrine||fr\n3|Rillettes||fr\n4|Crème brûlée||fr\n4|Tarte Tatin||fr\n3|Chocolate mousse|Mousse au chocolat|fr\n3|Profiteroles||fr\n4|Macaron||fr\n4|Éclair||fr\n3|Madeleine||fr\n3|Soufflé||fr\n2|Vol-au-vent/Bouchée à la reine|Bouchée à la reine/Vol-au-vent|fr\n2|Coquilles Saint-Jacques||fr\n2|Sole meunière||fr\n3|Steak tartare/Tartare||fr\n2|Œufs mimosa/Deviled eggs|Œufs mimosa|fr\n1|Œuf mayonnaise||fr\n2|Vichyssoise||fr\n3|French toast/Pain perdu|Pain perdu|fr\n3|Tarte flambée/Flammekueche||fr\n1|Kouign-amann||fr\n2|Far breton||fr\n2|Clafoutis||fr\n1|Panisse||fr\n2|Pan bagnat||fr\n1|Salade lyonnaise||fr\n1|Gougère||fr\n3|Jambon-beurre/Ham baguette|Jambon-beurre|fr\n3|French fries/Fries/Chips|Frites|fr\n3|Omelette||fr\n2|Cordon bleu||fr\n2|Paris-Brest||fr\n3|Mille-feuille||fr\n1|Gratin de pâtes||fr\n2|Tomates farcies/Stuffed tomatoes|Tomates farcies|fr\n2|Endives au jambon||fr\n2|Galette des rois||fr\n2|Bouillon||fr\n9|Sushi|Sushi/Sushis|jp\n8|Ramen||jp\n6|Sashimi||jp\n6|Tempura||jp\n6|Miso soup|Soupe miso|jp\n5|Udon||jp\n5|Teriyaki||jp\n5|Onigiri||jp\n4|Yakitori||jp\n4|Tonkatsu||jp\n4|Japanese curry/Katsu curry/Kare raisu|Curry japonais/Katsu curry|jp\n5|Gyoza|Gyoza/Gyozas|jp\n4|Takoyaki||jp\n4|Okonomiyaki||jp\n4|Soba||jp\n4|Mochi||jp\n3|Edamame||jp\n3|Bento||jp\n2|Donburi||jp\n2|Gyudon||jp\n2|Katsudon||jp\n1|Oyakodon||jp\n4|Maki|Maki/Makis|jp\n3|Nigiri||jp\n2|Temaki||jp\n3|Wagyu/Kobe beef|Wagyu/Bœuf de Kobe|jp\n2|Shabu-shabu||jp\n2|Sukiyaki||jp\n3|Yakisoba||jp\n2|Yakiniku||jp\n3|Karaage||jp\n2|Natto||jp\n2|Tamagoyaki||jp\n1|Chawanmushi||jp\n2|Dorayaki||jp\n2|Taiyaki||jp\n2|Dango||jp\n3|Matcha||jp\n2|Wasabi||jp\n3|Tofu||jp\n2|Unagi||jp\n2|Omurice||jp\n1|Nikujaga||jp\n1|Oden||jp\n1|Tsukemen||jp\n1|Nabe||jp\n1|Mentaiko||jp\n1|Ikura||jp\n1|Uni||jp\n1|Furikake||jp\n3|California roll||jp\n2|Melonpan||jp\n1|Senbei||jp\n2|Pocky||jp\n1|Kakigori||jp\n2|Chirashi||jp\n9|Taco|Taco/Tacos|mx\n8|Burrito||mx\n7|Nachos||mx\n7|Quesadilla||mx\n6|Guacamole||mx\n6|Enchilada||mx\n6|Fajitas||mx\n5|Chili con carne/Chili|Chili con carne|mx\n4|Tamale/Tamales|Tamal/Tamales|mx\n4|Churros||mx\n4|Salsa||mx\n4|Tortilla||mx\n3|Mole||mx\n2|Pozole||mx\n2|Chilaquiles||mx\n3|Tostada||mx\n2|Elote||mx\n3|Pico de gallo||mx\n2|Refried beans|Haricots frits|mx\n2|Carnitas||mx\n3|Tacos al pastor/Al pastor|Tacos al pastor|mx\n2|Barbacoa||mx\n2|Birria||mx\n1|Sopes||mx\n1|Gorditas||mx\n2|Huevos rancheros||mx\n2|Chimichanga||mx\n2|Flautas/Taquitos||mx\n2|Ceviche||mx\n1|Menudo||mx\n2|Tres leches||mx\n2|Horchata||mx\n1|Agua fresca||mx\n1|Esquites||mx\n2|Chiles rellenos||mx\n1|Cochinita pibil||mx\n1|Pambazo||mx\n1|Tlayuda||mx\n1|Torta||mx\n1|Queso fundido||mx\n1|Fish taco|Taco de poisson|mx\n3|Empanada||mx\n2|Mexican rice/Arroz rojo|Riz mexicain|mx\n1|Frijoles||mx\n3|Tortilla chips/Totopos|Chips de tortilla/Tortillas chips|mx\n2|Carne asada||mx\n2|Chorizo||mx\n1|Champurrado||mx\n1|Conchas||mx\n1|Pan de muerto||mx\n1|Paletas||mx\n1|Burrito bowl||mx\n2|Queso dip/Chile con queso|Chile con queso|mx\n8|Curry||in\n7|Naan|Naan/Nan|in\n7|Chicken tikka masala/Tikka masala|Poulet tikka masala/Tikka masala|in\n6|Butter chicken|Poulet au beurre/Butter chicken|in\n6|Biryani||in\n6|Samosa|Samoussa/Samosa|in\n5|Tandoori chicken/Tandoori|Poulet tandoori/Tandoori|in\n5|Dal/Dahl/Daal|Dal/Dhal|in\n4|Korma||in\n4|Vindaloo||in\n4|Chapati/Roti||in\n4|Pakora/Bhaji/Onion bhaji|Pakora/Bhaji|in\n3|Paneer||in\n3|Palak paneer/Saag paneer|Palak paneer|in\n4|Dosa/Masala dosa|Dosa|in\n2|Idli||in\n3|Chutney||in\n3|Raita|Raïta|in\n3|Lassi||in\n3|Chai/Masala chai|Chaï/Thé masala|in\n2|Jalfrezi||in\n2|Rogan josh||in\n2|Madras||in\n2|Balti||in\n1|Bhuna||in\n1|Dhansak||in\n2|Pilau/Pulao/Pilaf|Pilaf/Pulao|in\n3|Poppadom/Papadum|Papadum/Poppadom|in\n2|Paratha||in\n1|Puri||in\n2|Chana masala||in\n2|Aloo gobi||in\n1|Bombay potatoes/Bombay aloo|Pommes de terre Bombay|in\n2|Kofta||in\n2|Keema||in\n1|Seekh kebab||in\n2|Gulab jamun||in\n2|Jalebi||in\n2|Kulfi||in\n1|Kheer||in\n1|Ladoo||in\n1|Barfi||in\n2|Pani puri/Golgappa|Pani puri|in\n1|Bhel puri||in\n2|Pav bhaji||in\n2|Vada pav||in\n1|Uttapam||in\n2|Sambar||in\n1|Rasam||in\n2|Thali||in\n2|Dal makhani||in\n1|Malai kofta||in\n1|Rajma||in\n1|Upma||in\n1|Poha||in\n1|Halwa||in\n2|Momos||in\n2|Tikka||in\n1|Chole bhature||in\n6|Dumplings|Raviolis chinois/Dumplings|cn\n6|Spring rolls|Rouleaux de printemps/Nems|cn\n6|Fried rice/Egg fried rice|Riz cantonais/Riz frit|cn\n5|Sweet and sour pork/Sweet and sour chicken|Porc aigre-doux/Poulet aigre-doux|cn\n6|Peking duck|Canard laqué/Canard de Pékin|cn\n5|Chow mein||cn\n4|Kung Pao chicken|Poulet kung pao|cn\n5|Dim sum||cn\n4|Wonton/Wonton soup|Wonton/Soupe won ton|cn\n3|Mapo tofu||cn\n3|Hot pot|Fondue chinoise/Hot pot|cn\n4|Bao/Bao buns/Baozi|Bao/Baozi|cn\n2|Char siu||cn\n2|Chop suey||cn\n1|Scallion pancake|Galette à la ciboule|cn\n2|Dan dan noodles|Nouilles dan dan|cn\n2|Lo mein||cn\n2|Hot and sour soup|Soupe aigre-piquante|cn\n3|General Tso's chicken|Poulet du général Tao|cn\n2|Orange chicken|Poulet à l'orange|cn\n2|Egg roll||cn\n3|Xiaolongbao/Soup dumplings|Xiaolongbao|cn\n2|Siu mai/Shumai|Siu mai|cn\n1|Har gow||cn\n2|Congee||cn\n1|Zongzi||cn\n2|Mooncake|Gâteau de lune|cn\n2|Fortune cookie|Biscuit chinois/Fortune cookie|cn\n1|Tea eggs|Œufs au thé|cn\n2|Jiaozi||cn\n1|Lanzhou noodles|Nouilles de Lanzhou|cn\n1|Beef chow fun|Chow fun|cn\n1|Twice-cooked pork|Porc deux fois cuit|cn\n2|Crispy duck|Canard croustillant|cn\n2|Prawn crackers|Chips de crevettes|cn\n1|Sesame balls|Boules de sésame|cn\n2|Bubble tea|Bubble tea/Thé aux perles|cn\n1|Beef with broccoli|Bœuf aux brocolis|cn\n0|Rice|Riz|no\n0|Bread|Pain|no\n0|Burger/Hamburger||no\n0|Hot dog|Hot-dog|no\n0|Kebab||no\n0|Paella||no\n0|Pho|Phở/Pho|no\n0|Pad thai|Pad thaï|no\n0|Kimchi||no\n0|Couscous||no\n0|Fish and chips||no\n0|Poutine||no"},"fruits":{"z":1,"d":[],"e":"9|Apple|Pomme|\n9|Banana|Banane|\n8|Orange||\n8|Strawberry|Fraise|\n7|Grape|Raisin|\n7|Watermelon|Pastèque|\n7|Pineapple|Ananas|\n7|Mango|Mangue|\n7|Cherry|Cerise|\n7|Pear|Poire|\n7|Peach|Pêche|\n7|Lemon|Citron|\n6|Kiwi||\n6|Blueberry|Myrtille/Bleuet|\n6|Raspberry|Framboise|\n6|Melon||\n6|Coconut|Noix de coco/Coco|\n6|Plum/Prune|Prune|\n6|Apricot|Abricot|\n6|Lime|Citron vert|\n6|Grapefruit|Pamplemousse|\n5|Pomegranate|Grenade|\n5|Avocado|Avocat|\n5|Papaya|Papaye|\n5|Fig|Figue|\n5|Blackberry|Mûre|\n5|Passion fruit|Fruit de la passion/Maracuja|\n5|Lychee/Litchi|Litchi|\n5|Dragon fruit/Pitaya|Fruit du dragon/Pitaya|\n5|Tangerine/Mandarin|Mandarine|\n5|Clementine|Clémentine|\n5|Nectarine|Nectarine/Brugnon|\n4|Cranberry|Canneberge/Cranberry|\n5|Date|Datte|\n4|Tomato|Tomate|\n4|Redcurrant/Currant|Groseille|\n4|Blackcurrant|Cassis|\n3|Gooseberry|Groseille à maquereau|\n4|Guava|Goyave|\n4|Persimmon/Kaki|Kaki/Plaquemine|\n3|Quince|Coing|\n3|Kumquat||\n3|Star fruit/Carambola|Carambole|\n3|Jackfruit|Jacque|\n3|Durian||\n3|Rambutan|Ramboutan|\n3|Mangosteen|Mangoustan|\n2|Physalis/Cape gooseberry|Physalis/Amour en cage|\n2|Elderberry|Baie de sureau|\n2|Mulberry||\n3|Olive||\n3|Cantaloupe|Cantaloup|\n2|Honeydew/Honeydew melon|Melon miel|\n3|Plantain|Banane plantain|\n2|Lingonberry|Airelle|\n2|Cloudberry|Plaquebière|\n1|Boysenberry||\n1|Loganberry||\n1|Huckleberry||\n3|Açaí/Acai|Açaï|\n2|Goji/Goji berry|Baie de goji/Goji|\n1|Feijoa||\n2|Tamarind|Tamarin|\n1|Sapodilla|Sapotille|\n2|Soursop/Guanabana|Corossol|\n2|Cherimoya/Custard apple|Chérimole/Pomme cannelle|\n1|Longan|Longane|\n1|Salak/Snake fruit|Salak|\n1|Ugli fruit/Ugli||\n2|Yuzu||\n2|Pomelo|Pomélo|\n2|Bergamot|Bergamote|\n2|Blood orange|Orange sanguine|\n1|Satsuma||\n1|Medlar|Nèfle|\n1|Sloe|Prunelle|\n1|Rosehip|Cynorhodon|\n1|Damson||\n2|Greengage|Reine-claude|\n2|Mirabelle||\n1|Kiwano/Horned melon|Kiwano/Melon à cornes|\n1|Breadfruit|Fruit à pain|\n1|Ackee|Akée|\n1|Lucuma||\n1|Jabuticaba||\n1|Miracle fruit|Fruit miracle|\n1|Pawpaw|Asimine|\n2|Prickly pear|Figue de Barbarie|\n2|Rhubarb|Rhubarbe|\n2|Wild strawberry|Fraise des bois|\n1|Marula||\n1|Jujube||\n1|Loquat|Nèfle du Japon/Bibasse|\n1|Carob|Caroube|\n1|Bilberry||\n2|Nashi/Asian pear|Nashi/Poire asiatique|\n1|Pitanga/Surinam cherry|Pitanga|\n1|Mamey||\n0|Berry|Baie|no\n0|Fruit salad|Salade de fruits|no\n0|Carrot|Carotte|no\n0|Potato|Pomme de terre|no\n0|Nut|Noix|no"},"vegetables":{"z":1,"d":[],"e":"9|Carrot|Carotte|\n9|Potato|Pomme de terre/Patate|\n8|Tomato|Tomate|\n8|Broccoli|Brocoli|\n7|Onion|Oignon|\n7|Lettuce|Laitue/Salade|\n7|Cucumber|Concombre|\n7|Pepper/Bell pepper/Capsicum|Poivron|\n7|Spinach|Épinard/Épinards|\n6|Cabbage|Chou|\n6|Cauliflower|Chou-fleur|\n6|Pea/Peas|Petit pois/Pois|\n6|Corn/Sweetcorn/Maize|Maïs|\n6|Garlic|Ail|\n6|Mushroom|Champignon|\n6|Zucchini/Courgette|Courgette|\n6|Aubergine/Eggplant|Aubergine|\n6|Pumpkin|Citrouille/Potiron|\n6|Green bean/French bean|Haricot vert|\n5|Bean|Haricot|\n5|Leek|Poireau|\n5|Celery|Céleri|\n5|Asparagus|Asperge|\n5|Beetroot/Beet|Betterave|\n5|Radish|Radis|\n5|Sweet potato|Patate douce|\n4|Kale|Chou kale/Kale|\n5|Brussels sprout|Chou de Bruxelles|\n5|Artichoke|Artichaut|\n4|Turnip|Navet|\n3|Parsnip|Panais|\n4|Shallot|Échalote|\n4|Fennel|Fenouil|\n4|Chilli/Chili/Chili pepper|Piment|\n3|Squash|Courge|\n3|Butternut squash/Butternut|Butternut/Courge butternut|\n3|Okra|Gombo|\n4|Lentil|Lentille|\n4|Chickpea|Pois chiche|\n3|Endive/Chicory|Endive/Chicorée|\n3|Rocket/Arugula|Roquette|\n3|Watercress|Cresson|\n3|Swiss chard/Chard|Blette/Bette|\n2|Celeriac|Céleri-rave|\n2|Kohlrabi|Chou-rave|\n2|Rutabaga/Swede|Rutabaga|\n2|Jerusalem artichoke|Topinambour|\n2|Salsify|Salsifis|\n2|Bok choy/Pak choi|Pak-choï/Bok choy|\n2|Lamb's lettuce/Corn salad|Mâche|\n3|Spring onion/Scallion/Green onion|Oignon vert/Ciboule|\n2|Radicchio|Trévise|\n2|Romanesco|Chou romanesco/Romanesco|\n2|Snow pea/Mangetout|Pois mange-tout|\n3|Broad bean/Fava bean|Fève|\n3|Soybean/Soya/Edamame|Soja/Edamame|\n2|Yam|Igname|\n2|Cassava/Manioc|Manioc|\n2|Taro||\n2|Ginger|Gingembre|\n2|Horseradish|Raifort|\n2|Daikon|Radis blanc/Daikon|\n1|Lotus root|Racine de lotus|\n2|Bamboo shoot|Pousse de bambou|\n2|Bean sprouts|Germes de soja|\n1|Water chestnut|Châtaigne d'eau|\n1|Jicama||\n1|Tomatillo||\n1|Seaweed|Algue|\n1|Samphire|Salicorne|\n1|Sorrel|Oseille|\n1|Purslane|Pourpier|\n1|Nettle|Ortie|\n1|Cardoon|Cardon|\n1|Chayote|Christophine/Chayote|\n1|Courgette flower|Fleur de courgette|\n3|Gherkin/Pickle|Cornichon|\n2|Olive||\n2|Iceberg lettuce|Iceberg|\n2|Romaine||\n2|Cherry tomato|Tomate cerise|\n2|Red cabbage|Chou rouge|\n1|Savoy cabbage|Chou de Milan|\n1|Black radish|Radis noir|\n1|Morel|Morille|\n2|Truffle|Truffe|\n1|Chanterelle|Girolle|\n2|Porcini/Cep|Cèpe|\n1|Shiitake|Shiitaké|\n1|Oyster mushroom|Pleurote|\n2|Button mushroom|Champignon de Paris|\n2|Kidney bean|Haricot rouge|\n1|Black bean|Haricot noir|\n1|Mung bean|Haricot mungo|\n1|Lima bean|Haricot de Lima|\n1|Pinto bean||\n1|White bean/Navy bean|Haricot blanc/Lingot|\n1|Flageolet||\n1|Split pea|Pois cassé|\n2|Jalapeño/Jalapeno|Jalapeño|\n1|Habanero||\n1|Pea shoots|Pousses de pois|\n0|Apple|Pomme|no\n0|Banana|Banane|no\n0|Rice|Riz|no\n0|Salad (dish)||no"},"cheeses":{"z":1,"d":["cheese","cheeses","fromage","fromages"],"e":"9|Cheddar||\n8|Mozzarella||\n8|Brie||\n8|Camembert||\n8|Parmesan/Parmigiano Reggiano/Parmigiano|Parmesan/Parmigiano Reggiano|\n7|Feta||\n7|Gouda||\n7|Roquefort||\n7|Emmental/Emmentaler/Swiss cheese|Emmental|\n7|Comté||\n6|Raclette||\n6|Reblochon||\n6|Goat cheese/Chèvre|Fromage de chèvre/Chèvre|\n6|Mascarpone||\n6|Ricotta||\n6|Gorgonzola||\n6|Edam|Édam/Edam|\n6|Halloumi||\n5|Cream cheese|Fromage à la crème/Fromage frais|\n5|Cottage cheese|Cottage cheese/Cottage|\n6|Gruyère||\n5|Beaufort||\n5|Cantal||\n5|Munster/Muenster|Munster|\n4|Morbier||\n4|Saint-Nectaire||\n5|Tomme/Tomme de Savoie||\n3|Pont-l'Évêque||\n3|Livarot||\n2|Neufchâtel||\n3|Coulommiers||\n2|Chaource||\n3|Époisses||\n2|Langres||\n4|Maroilles||\n4|Mimolette||\n3|Ossau-Iraty||\n3|Fourme d'Ambert||\n3|Bleu d'Auvergne||\n2|Bleu de Gex||\n2|Salers||\n2|Laguiole||\n2|Abondance||\n3|Mont d'Or/Vacherin Mont-d'Or|Mont-d'Or/Vacherin du Haut-Doubs|\n3|Crottin de Chavignol/Crottin||\n2|Sainte-Maure/Sainte-Maure de Touraine|Sainte-Maure-de-Touraine|\n2|Valençay||\n2|Rocamadour||\n2|Banon||\n2|Brocciu||\n4|Boursin||\n2|Saint-Marcellin||\n2|Cancoillotte||\n3|Fromage blanc||\n2|Petit-suisse||\n5|Burrata||\n5|Pecorino||\n4|Provolone||\n3|Taleggio||\n3|Fontina||\n3|Asiago||\n3|Grana Padano||\n2|Stracchino||\n2|Scamorza||\n1|Bel Paese||\n5|Manchego||\n4|Stilton||\n3|Red Leicester||\n2|Double Gloucester||\n3|Wensleydale||\n2|Cheshire||\n1|Lancashire||\n1|Caerphilly||\n1|Shropshire Blue||\n3|Monterey Jack||\n2|Colby||\n3|American cheese||\n2|Pepper Jack||\n4|Paneer||\n2|Queso fresco||\n1|Cotija||\n1|Oaxaca||\n2|Havarti||\n2|Danish Blue|Bleu danois|\n2|Jarlsberg||\n1|Brunost/Brown cheese|Brunost|\n3|Leerdammer||\n1|Maasdam||\n2|Limburger|Limbourg|\n2|Appenzeller||\n2|Tête de Moine||\n1|Vacherin Fribourgeois|Vacherin fribourgeois|\n1|Sbrinz||\n1|Kefalotyri||\n1|Kasseri||\n2|Labneh||\n2|Quark||\n1|Boursault||\n2|Cabrales||\n1|Idiazabal||\n1|Mahón||\n1|Torta del Casar||\n1|Serra da Estrela||\n2|Buffalo mozzarella/Mozzarella di bufala|Mozzarella di bufala|\n1|String cheese||\n1|Velveeta||\n3|Babybel/Mini Babybel|Babybel|\n3|Laughing Cow/La Vache qui rit|La Vache qui rit/Vache qui rit|\n2|Kiri||\n3|Philadelphia||\n2|Saint Agur||\n2|Bleu des Causses||\n2|Rigotte de Condrieu||\n2|Pélardon||\n2|Picodon||\n2|Chabichou||\n2|Selles-sur-Cher||\n2|Pouligny-Saint-Pierre||\n2|Tomme de brebis||\n2|Brillat-Savarin||\n2|Caprice des Dieux||\n2|Carré de l'Est||\n2|Saint-Félicien||\n0|Butter|Beurre|no\n0|Yogurt/Yoghurt|Yaourt|no\n0|Milk|Lait|no"},"spices":{"z":1,"d":[],"e":"9|Pepper/Black pepper|Poivre/Poivre noir|\n8|Cinnamon|Cannelle|\n7|Basil|Basilic|\n6|Paprika||\n6|Curry/Curry powder|Curry|\n6|Ginger|Gingembre|\n6|Garlic|Ail|\n6|Oregano|Origan|\n6|Thyme|Thym|\n6|Rosemary|Romarin|\n6|Mint|Menthe|\n6|Parsley|Persil|\n6|Vanilla|Vanille|\n5|Nutmeg|Noix de muscade/Muscade|\n5|Cumin||\n5|Turmeric|Curcuma|\n5|Saffron|Safran|\n5|Chili/Chilli/Chili powder|Piment|\n4|Cayenne/Cayenne pepper|Piment de Cayenne|\n5|Clove/Cloves|Clou de girofle/Girofle|\n5|Coriander/Cilantro|Coriandre|\n4|Dill|Aneth|\n5|Chives|Ciboulette|\n4|Sage|Sauge|\n4|Bay leaf/Bay|Laurier/Feuille de laurier|\n4|Tarragon|Estragon|\n4|Cardamom|Cardamome|\n3|Star anise|Anis étoilé/Badiane|\n3|Anise/Aniseed|Anis|\n2|Fennel seed|Graine de fenouil|\n2|Mustard seed|Graine de moutarde|\n2|Allspice|Piment de la Jamaïque|\n2|Chervil|Cerfeuil|\n2|Marjoram|Marjolaine|\n3|Lemongrass|Citronnelle|\n2|Sumac||\n2|Za'atar|Zaatar|\n2|Garam masala||\n4|Herbes de Provence||\n2|Five-spice/Chinese five-spice|Cinq-épices|\n2|Ras el hanout||\n3|Harissa||\n3|Wasabi||\n2|Horseradish|Raifort|\n2|Juniper/Juniper berry|Genièvre/Baie de genièvre|\n3|Sesame|Sésame|\n2|Poppy seed|Graine de pavot/Pavot|\n2|Caraway|Carvi|\n1|Fenugreek|Fenugrec|\n1|Asafoetida|Asa-fœtida|\n1|Mace|Macis|\n1|Lovage|Livèche|\n1|Savory|Sarriette|\n1|Sorrel|Oseille|\n1|Lemon balm|Mélisse|\n2|Pink peppercorn|Baies roses|\n2|Sichuan pepper|Poivre du Sichuan|\n2|White pepper|Poivre blanc|\n2|Smoked paprika|Paprika fumé|\n3|Espelette pepper|Piment d'Espelette|\n1|Nigella|Nigelle|\n1|Kaffir lime leaf/Makrut lime|Combava|\n1|Galangal|Galanga|\n1|Shiso||\n2|Lavender|Lavande|\n1|Borage|Bourrache|\n1|Angelica|Angélique|\n1|Hyssop|Hysope|\n2|Licorice/Liquorice|Réglisse|\n2|Quatre épices|Quatre-épices|\n1|Annatto|Roucou|\n1|Long pepper|Poivre long|\n1|Curry leaf|Feuille de curry/Kaloupilé|\n1|Celery seed|Graine de céleri|\n1|Dried chilli flakes/Chilli flakes|Piment en flocons|\n1|Mahlab|Mahaleb|\n0|Salt|Sel|no\n0|Sugar|Sucre|no\n0|Ketchup||no\n0|Mustard|Moutarde|no"},"desserts":{"z":1,"d":[],"e":"9|Ice cream|Glace/Crème glacée|\n8|Cake|Gâteau|\n7|Chocolate cake|Gâteau au chocolat|\n7|Cheesecake|Cheesecake/Gâteau au fromage|\n7|Brownie||\n7|Tiramisu||\n7|Crêpe||\n4|Pancake||\n6|Waffle|Gaufre|\n6|Apple pie|Tarte aux pommes|\n6|Cupcake||\n5|Muffin||\n6|Cookie/Biscuit||\n6|Donut/Doughnut|Donut/Beignet|\n6|Macaron||\n6|Crème brûlée||\n6|Chocolate mousse/Mousse|Mousse au chocolat|\n5|Pudding||\n3|Jelly/Jello|Gelée|\n5|Panna cotta||\n5|Profiteroles||\n6|Éclair||\n5|Mille-feuille/Napoleon|Mille-feuille|\n5|Tarte Tatin||\n5|Lava cake/Molten chocolate cake/Fondant|Fondant au chocolat/Moelleux au chocolat|\n5|Crumble/Apple crumble|Crumble|\n3|Trifle||\n5|Sorbet||\n3|Sundae|Sundae/Coupe glacée|\n3|Banana split||\n4|Milkshake||\n5|Churros||\n4|Baklava||\n2|Gulab jamun||\n4|Mochi||\n5|Flan/Crème caramel||\n4|Clafoutis||\n2|Far breton||\n2|Kouign-amann||\n3|Paris-Brest||\n2|Saint-Honoré||\n2|Opéra||\n3|Black Forest cake|Forêt-noire|\n3|Yule log/Bûche de Noël|Bûche de Noël|\n3|King cake/Galette des rois|Galette des rois|\n4|Madeleine||\n2|Financier||\n3|Canelé||\n2|Calisson||\n3|Nougat||\n4|Meringue||\n3|Pavlova||\n3|Floating island/Île flottante|Île flottante|\n2|Croquembouche|Croquembouche/Pièce montée|\n3|Charlotte||\n2|Fraisier||\n4|Lemon tart/Lemon meringue pie|Tarte au citron/Tarte au citron meringuée|\n2|Pecan pie|Tarte aux noix de pécan|\n2|Pumpkin pie|Tarte à la citrouille|\n2|Key lime pie||\n3|Carrot cake|Gâteau aux carottes/Carrot cake|\n3|Red velvet/Red velvet cake|Red velvet|\n1|Angel food cake|Gâteau des anges|\n3|Pound cake|Quatre-quarts|\n2|Sponge cake|Génoise|\n2|Swiss roll|Gâteau roulé/Biscuit roulé|\n2|Victoria sponge||\n2|Banoffee pie|Banoffee|\n2|Sticky toffee pudding||\n1|Bread and butter pudding|Pudding au pain|\n3|Rice pudding|Riz au lait|\n3|Cannoli||\n3|Gelato||\n1|Zabaglione/Sabayon|Sabayon|\n1|Semifreddo||\n2|Affogato||\n3|Panettone||\n3|Strudel/Apple strudel|Strudel/Strudel aux pommes|\n2|Sachertorte/Sacher torte|Sachertorte|\n1|Kaiserschmarrn||\n1|Linzer torte|Linzertorte|\n3|Fudge||\n4|Caramel/Toffee|Caramel|\n3|Marshmallow|Guimauve/Chamallow|\n2|S'mores||\n1|Brigadeiro||\n2|Tres leches||\n1|Arroz con leche||\n2|Alfajor||\n2|Dulce de leche|Confiture de lait|\n1|Halva||\n1|Kulfi||\n1|Kheer||\n1|Jalebi||\n1|Loukoumades||\n2|Turkish delight/Lokum|Loukoum|\n2|Knafeh/Kunafa|Knafeh|\n1|Basbousa|Basboussa|\n2|Ice lolly/Popsicle|Glace à l'eau/Esquimau|\n2|Frozen yogurt/Froyo|Yaourt glacé|\n1|Granita|Granité|\n1|Bingsu||\n1|Dango||\n1|Dorayaki||\n1|Taiyaki||\n1|Daifuku||\n2|Pastel de nata/Egg tart|Pastel de nata|\n1|Crema catalana|Crème catalane|\n1|Tarta de Santiago||\n1|Turrón|Touron/Turrón|\n2|Chocolate fondue|Fondue au chocolat|\n3|Soufflé||\n1|Bavarian cream/Bavarois|Bavarois|\n2|Parfait||\n1|Blancmange|Blanc-manger|\n1|Petit four||\n2|Crêpe Suzette||\n3|Apple turnover|Chausson aux pommes|\n2|Tarte aux fraises/Strawberry tart|Tarte aux fraises|\n2|Fruit salad|Salade de fruits|\n2|Lemon drizzle cake||\n2|Banana bread|Cake à la banane|\n2|Cinnamon roll|Roulé à la cannelle|\n2|Gingerbread|Pain d'épices|\n2|Shortbread|Sablé écossais|\n1|Mont Blanc|Mont-Blanc|\n1|Religieuse||\n1|Tarte au sucre||\n1|Bugnes/Merveilles|Bugnes|\n1|Gâteau basque||\n0|Chocolate|Chocolat|no\n0|Candy/Sweets|Bonbon|no\n0|Fruit||no\n0|Bread|Pain|no"},"pasta":{"z":1,"d":["pasta","pates"],"e":"9|Spaghetti|Spaghetti/Spaghettis|\n8|Penne||\n7|Macaroni|Macaroni/Macaronis|\n7|Lasagne/Lasagna|Lasagne/Lasagnes|\n7|Fusilli|Fusilli/Torsades|\n6|Tagliatelle|Tagliatelle/Tagliatelles|\n6|Ravioli|Ravioli/Raviolis|\n6|Farfalle/Bow ties/Bowtie pasta|Farfalle/Papillons|\n5|Linguine||\n5|Fettuccine||\n5|Tortellini||\n5|Rigatoni||\n5|Gnocchi||\n4|Cannelloni||\n4|Conchiglie/Shells/Pasta shells|Conchiglie/Coquillettes|\n3|Orzo/Risoni||\n3|Pappardelle||\n4|Vermicelli|Vermicelle/Vermicelles|\n3|Orecchiette||\n2|Ziti||\n3|Capellini/Angel hair|Capellini/Cheveux d'ange|\n2|Bucatini||\n1|Tortiglioni||\n1|Cavatappi||\n2|Rotini||\n1|Gemelli||\n1|Ditalini||\n2|Paccheri||\n1|Mafaldine||\n1|Strozzapreti||\n1|Trofie||\n1|Pici||\n1|Agnolotti||\n1|Tortelloni||\n1|Cappelletti||\n1|Anelli||\n1|Stelline||\n1|Radiatori||\n1|Campanelle||\n1|Casarecce||\n1|Fregola||\n1|Lumaconi||\n1|Manicotti||\n1|Mezze maniche||\n1|Garganelli||\n1|Fideo/Fideos|Fideos|\n2|Spätzle/Spaetzle|Spätzle|\n2|Couscous||\n1|Spaghettini||\n1|Bigoli||\n1|Crozets||\n1|Alphabet pasta|Pâtes alphabet|\n1|Tagliolini||\n1|Malloreddus||\n0|Noodles|Nouilles|no\n0|Ramen||no\n0|Udon||no\n0|Rice|Riz|no"},"breads":{"z":1,"d":["bread","breads","pain"],"e":"9|Baguette||\n7|Croissant||\n6|Brioche||\n6|Naan|Naan/Nan|\n6|Pita/Pitta|Pita|\n6|Bagel||\n5|Ciabatta||\n5|Focaccia||\n5|Sourdough|Pain au levain/Levain|\n5|Tortilla||\n4|Toast|Pain grillé|\n5|Sliced bread/Sandwich bread|Pain de mie|\n4|Country bread/Pain de campagne|Pain de campagne/Campagne|\n4|Rye bread|Pain de seigle/Seigle|\n4|Wholemeal bread/Whole wheat bread|Pain complet/Complet|\n5|Pretzel|Bretzel|\n6|Pain au chocolat/Chocolatine||\n3|Pain aux raisins||\n4|Chapati||\n3|Roti||\n2|Paratha||\n3|Cornbread|Pain de maïs|\n2|Soda bread||\n2|Challah|Hallah/Challah|\n2|Pumpernickel||\n2|Matzo/Matzah|Matsa/Pain azyme|\n1|Lavash||\n1|Injera||\n2|Arepa||\n2|Grissini/Breadsticks|Gressins/Grissini|\n3|Panettone||\n2|Stollen||\n3|Bun/Bread roll|Petit pain|\n2|Crumpet||\n2|English muffin|Muffin anglais|\n3|Scone||\n3|Fougasse||\n2|Gingerbread/Pain d'épices|Pain d'épices|\n2|Ficelle||\n1|Bâtard||\n2|Boule||\n2|Pain viennois||\n1|Kaiser roll|Kaiser|\n1|Bialy||\n1|Babka||\n1|Kouign-amann||\n1|Pão de queijo||\n2|Bao/Steamed bun|Bao/Brioche vapeur|\n1|Mantou||\n1|Melonpan||\n1|Simit||\n1|Khachapuri||\n1|Pane carasau||\n2|Flatbread|Pain plat/Galette|\n2|Garlic bread|Pain à l'ail|\n2|Hot cross bun||\n2|Multigrain bread|Pain aux céréales/Pain multicéréale|\n2|Milk bread|Pain au lait|\n1|Spelt bread|Pain d'épeautre|\n1|Puri||\n1|Pandoro||\n1|Piadina||\n1|Brötchen||\n1|Pide||\n0|Cake|Gâteau|no\n0|Biscuit||no\n0|Cracker||no"},"sauces":{"z":1,"d":["sauce","sauces"],"e":"9|Ketchup||\n8|Mayonnaise/Mayo||\n7|Mustard|Moutarde|\n6|Barbecue sauce/BBQ sauce/Barbecue/BBQ|Sauce barbecue/Barbecue|\n6|Pesto||\n6|Soy sauce/Soy|Sauce soja/Soja|\n6|Tomato sauce|Sauce tomate/Coulis de tomate|\n6|Béchamel/White sauce|Béchamel|\n5|Hollandaise||\n5|Béarnaise||\n5|Vinaigrette/French dressing|Vinaigrette|\n5|Salsa||\n5|Guacamole||\n4|Hummus|Houmous/Hummus|\n4|Gravy|Gravy/Jus|\n4|Sriracha||\n5|Hot sauce/Tabasco|Sauce piquante/Tabasco|\n3|Worcestershire sauce/Worcestershire|Sauce Worcestershire|\n4|Aioli/Aïoli|Aïoli|\n4|Tartar sauce/Tartare sauce|Sauce tartare/Tartare|\n4|Teriyaki||\n3|Sweet chilli sauce/Sweet chili sauce|Sauce chili douce|\n2|Hoisin||\n2|Oyster sauce|Sauce d'huître|\n2|Fish sauce/Nuoc mam|Sauce de poisson/Nuoc-mâm|\n3|Ranch||\n2|Thousand Island|Mille-îles|\n2|Caesar dressing|Sauce César|\n3|Tzatziki||\n3|Harissa||\n2|Chimichurri||\n2|Mole||\n2|Tahini|Tahini/Tahina|\n4|Samurai sauce/Samouraï|Samouraï/Sauce samouraï|\n4|Algerian sauce/Algérienne|Algérienne/Sauce algérienne|\n3|Andalouse||\n3|Cocktail sauce/Marie Rose|Sauce cocktail|\n3|Curry sauce|Sauce curry|\n3|Pepper sauce/Peppercorn sauce|Sauce au poivre|\n2|Mushroom sauce|Sauce aux champignons|\n2|Beurre blanc||\n1|Velouté||\n1|Espagnole||\n1|Demi-glace||\n1|Bordelaise||\n1|Gribiche||\n1|Ravigote||\n2|Rouille||\n2|Pistou||\n2|Tapenade||\n1|Romesco||\n3|Bolognese|Bolognaise|\n2|Arrabbiata||\n2|Alfredo||\n2|Carbonara||\n2|Marinara||\n1|Puttanesca||\n2|Cranberry sauce|Sauce aux canneberges|\n2|Mint sauce|Sauce à la menthe|\n1|Apple sauce|Compote de pommes|\n2|Brown sauce/HP sauce|Brown sauce/Sauce HP|\n1|Piccalilli||\n2|Relish||\n2|Wasabi||\n1|Ponzu||\n2|Gochujang||\n1|Sambal||\n2|Peanut sauce/Satay sauce|Sauce satay/Sauce cacahuète|\n1|Raita|Raïta|\n2|Mango chutney/Chutney|Chutney|\n1|Ajvar||\n2|Caramel sauce|Sauce caramel|\n2|Chocolate sauce|Sauce chocolat|\n3|Custard|Crème anglaise|\n1|Honey mustard|Moutarde au miel|\n3|Sauce blanche/Garlic sauce|Sauce blanche/Sauce à l'ail|\n2|Sweet and sour sauce|Sauce aigre-douce|\n2|Buffalo sauce|Sauce Buffalo|\n1|Mornay||\n1|Bourguignonne||\n1|Sauce vierge||\n0|Salt|Sel|no\n0|Butter|Beurre|no\n0|Oil/Olive oil|Huile/Huile d'olive|no\n0|Vinegar|Vinaigre|no"},"countries":{"z":1,"d":[],"e":"6|Algeria|Algérie|af\n4|Angola||af\n3|Benin|Bénin|af\n4|Botswana||af ll\n3|Burkina Faso||af ll\n3|Burundi||af ll\n2|Cape Verde/Cabo Verde|Cap-Vert|af isl\n5|Cameroon|Cameroun|af\n2|Central African Republic/CAR|République centrafricaine/Centrafrique|af ll\n3|Chad|Tchad|af ll\n2|Comoros|Comores|af isl\n4|Republic of the Congo/Congo/Congo-Brazzaville/Congo Republic|République du Congo/Congo/Congo-Brazzaville|af\n4|DR Congo/Democratic Republic of the Congo/DRC/Congo-Kinshasa/Zaire|République démocratique du Congo/RDC/RD Congo/Congo-Kinshasa/Zaïre|af\n3|Djibouti||af\n9|Egypt|Égypte|af\n2|Equatorial Guinea|Guinée équatoriale|af\n2|Eritrea|Érythrée|af\n2|Eswatini/Swaziland||af ll\n5|Ethiopia|Éthiopie|af ll\n3|Gabon||af\n3|Gambia/The Gambia|Gambie|af\n6|Ghana||af\n3|Guinea|Guinée|af\n2|Guinea-Bissau|Guinée-Bissau|af\n5|Ivory Coast/Côte d'Ivoire|Côte d'Ivoire|af\n7|Kenya||af\n2|Lesotho||af ll\n3|Liberia|Libéria|af\n5|Libya|Libye|af\n6|Madagascar||af isl\n3|Malawi||af ll\n5|Mali||af ll\n3|Mauritania|Mauritanie|af\n3|Mauritius|Maurice/Île Maurice|af isl\n7|Morocco|Maroc|af\n4|Mozambique||af\n4|Namibia|Namibie|af\n4|Niger||af ll\n8|Nigeria|Nigéria|af\n4|Rwanda||af ll\n1|Sao Tome and Principe/São Tomé and Príncipe|Sao Tomé-et-Principe/São Tomé-et-Príncipe|af isl\n6|Senegal|Sénégal|af\n3|Seychelles||af isl\n3|Sierra Leone||af\n5|Somalia|Somalie|af\n8|South Africa|Afrique du Sud|af\n3|South Sudan|Soudan du Sud|af ll\n5|Sudan|Soudan|af\n5|Tanzania|Tanzanie|af\n3|Togo||af\n6|Tunisia|Tunisie|af\n5|Uganda|Ouganda|af ll\n4|Zambia|Zambie|af ll\n5|Zimbabwe||af ll\n6|Afghanistan||as ll\n4|Armenia|Arménie|as eu ll\n4|Azerbaijan|Azerbaïdjan|as eu ll\n3|Bahrain|Bahreïn|as isl\n5|Bangladesh||as\n3|Bhutan|Bhoutan|as ll\n2|Brunei||as\n4|Cambodia|Cambodge|as\n9|China|Chine|as\n4|Cyprus|Chypre|as eu isl\n4|Georgia|Géorgie|as eu\n9|India|Inde|as\n6|Indonesia|Indonésie|as isl\n6|Iran||as\n6|Iraq|Irak|as\n6|Israel|Israël|as\n9|Japan|Japon|as isl\n5|Jordan|Jordanie|as\n5|Kazakhstan||as eu ll\n4|Kuwait|Koweït|as\n3|Kyrgyzstan/Kirghizstan|Kirghizistan/Kirghizstan|as ll\n3|Laos||as ll\n5|Lebanon|Liban|as\n5|Malaysia|Malaisie|as\n4|Maldives||as isl\n5|Mongolia|Mongolie|as ll\n4|Myanmar/Burma|Myanmar/Birmanie|as\n5|Nepal|Népal|as ll\n6|North Korea|Corée du Nord|as\n4|Oman||as\n6|Pakistan||as\n4|Palestine|Palestine/État de Palestine|as\n6|Philippines||as isl\n5|Qatar||as\n8|Russia|Russie|as eu\n6|Saudi Arabia|Arabie saoudite|as\n5|Singapore|Singapour|as isl\n7|South Korea/Korea|Corée du Sud/Corée|as\n5|Sri Lanka||as isl\n5|Syria|Syrie|as\n5|Taiwan|Taïwan|as isl\n3|Tajikistan|Tadjikistan|as ll\n6|Thailand|Thaïlande|as\n2|East Timor/Timor-Leste|Timor oriental/Timor-Leste|as isl\n7|Turkey/Türkiye|Turquie|as eu\n3|Turkmenistan|Turkménistan|as ll\n5|United Arab Emirates/UAE/Emirates|Émirats arabes unis/EAU/Émirats|as\n3|Uzbekistan|Ouzbékistan|as ll\n6|Vietnam/Viet Nam|Viêt Nam/Vietnam|as\n4|Yemen|Yémen|as\n4|Albania|Albanie|eu\n4|Andorra|Andorre|eu ll\n6|Austria|Autriche|eu ll\n4|Belarus|Biélorussie/Bélarus|eu ll\n7|Belgium|Belgique|eu\n4|Bosnia and Herzegovina/Bosnia|Bosnie-Herzégovine/Bosnie|eu\n5|Bulgaria|Bulgarie|eu\n6|Croatia|Croatie|eu\n5|Czechia/Czech Republic|Tchéquie/République tchèque|eu ll\n6|Denmark|Danemark|eu\n4|Estonia|Estonie|eu\n6|Finland|Finlande|eu\n9|France||eu\n9|Germany|Allemagne|eu\n7|Greece|Grèce|eu\n5|Hungary|Hongrie|eu ll\n6|Iceland|Islande|eu isl\n6|Ireland|Irlande|eu isl\n9|Italy|Italie|eu\n3|Kosovo||eu ll\n4|Latvia|Lettonie|eu\n3|Liechtenstein||eu ll\n4|Lithuania|Lituanie|eu\n5|Luxembourg||eu ll\n4|Malta|Malte|eu isl\n3|Moldova|Moldavie|eu ll\n5|Monaco||eu\n3|Montenegro|Monténégro|eu\n7|Netherlands/Holland|Pays-Bas/Hollande|eu\n3|North Macedonia/Macedonia|Macédoine du Nord/Macédoine|eu ll\n7|Norway|Norvège|eu\n7|Poland|Pologne|eu\n7|Portugal||eu\n5|Romania|Roumanie|eu\n3|San Marino|Saint-Marin|eu ll\n5|Serbia|Serbie|eu ll\n4|Slovakia|Slovaquie|eu ll\n4|Slovenia|Slovénie|eu\n9|Spain|Espagne|eu\n7|Sweden|Suède|eu\n7|Switzerland|Suisse|eu ll\n7|Ukraine||eu\n8|United Kingdom/UK/Great Britain/Britain|Royaume-Uni/Grande-Bretagne|eu isl\n4|Vatican City/Vatican/Holy See|Vatican/Cité du Vatican/Saint-Siège|eu ll\n7|England|Angleterre|eu\n6|Scotland|Écosse|eu\n5|Wales|Pays de Galles|eu\n4|Northern Ireland|Irlande du Nord|eu\n2|Antigua and Barbuda/Antigua|Antigua-et-Barbuda|na isl\n4|Bahamas/The Bahamas||na isl\n3|Barbados|Barbade|na isl\n3|Belize||na\n9|Canada||na\n5|Costa Rica||na\n6|Cuba||na isl\n2|Dominica|Dominique|na isl\n4|Dominican Republic|République dominicaine|na isl\n3|El Salvador|Salvador|na\n2|Grenada|Grenade|na isl\n4|Guatemala||na\n5|Haiti|Haïti|na isl\n4|Honduras||na\n6|Jamaica|Jamaïque|na isl\n8|Mexico|Mexique|na\n4|Nicaragua||na\n5|Panama||na\n1|Saint Kitts and Nevis/St Kitts and Nevis|Saint-Christophe-et-Niévès/Saint-Kitts-et-Nevis|na isl\n2|Saint Lucia/St Lucia|Sainte-Lucie|na isl\n1|Saint Vincent and the Grenadines|Saint-Vincent-et-les-Grenadines|na isl\n3|Trinidad and Tobago/Trinidad|Trinité-et-Tobago|na isl\n9|United States/USA/US/United States of America/America|États-Unis/Etats-Unis d'Amérique/Amérique|na\n8|Argentina|Argentine|sa\n5|Bolivia|Bolivie|sa ll\n9|Brazil|Brésil|sa\n6|Chile|Chili|sa\n6|Colombia|Colombie|sa\n5|Ecuador|Équateur|sa\n3|Guyana||sa\n4|Paraguay||sa ll\n6|Peru|Pérou|sa\n3|Suriname/Surinam||sa\n5|Uruguay||sa\n6|Venezuela||sa\n9|Australia|Australie|oc\n4|Fiji|Fidji|oc isl\n2|Kiribati||oc isl\n2|Marshall Islands|Îles Marshall|oc isl\n2|Micronesia|Micronésie|oc isl\n2|Nauru||oc isl\n7|New Zealand|Nouvelle-Zélande|oc isl\n2|Palau|Palaos|oc isl\n4|Papua New Guinea|Papouasie-Nouvelle-Guinée|oc isl\n3|Samoa||oc isl\n2|Solomon Islands|Îles Salomon|oc isl\n3|Tonga||oc isl\n2|Tuvalu||oc isl\n2|Vanuatu||oc isl\n0|Greenland|Groenland|no\n0|Puerto Rico|Porto Rico|no\n0|Hong Kong||no\n0|Antarctica|Antarctique|no\n0|Africa|Afrique|no\n0|Europe||no\n0|Asia|Asie|no\n0|South America|Amérique du Sud|no\n0|North America|Amérique du Nord|no\n0|Oceania|Océanie|no\n0|Yugoslavia|Yougoslavie|no\n0|Soviet Union/USSR|Union soviétique/URSS|no\n0|Czechoslovakia|Tchécoslovaquie|no\n0|Tibet||no\n0|Siberia|Sibérie|no\n0|French Guiana|Guyane/Guyane française|no\n0|Corsica|Corse|no\n0|Tahiti||no\n0|New Caledonia|Nouvelle-Calédonie|no\n0|Bermuda|Bermudes|no\n0|Gibraltar||no\n0|Western Sahara|Sahara occidental|no\n0|Persia|Perse|no\n0|Prussia|Prusse|no\n0|Catalonia|Catalogne|no\n0|Hawaii|Hawaï|no\n0|Bali||no\n0|Zanzibar||no"},"capitals":{"z":1,"d":[],"e":"5|Algiers|Alger|af\n3|Luanda||af\n1|Porto-Novo||af\n2|Gaborone||af\n3|Ouagadougou||af\n1|Gitega||af\n1|Praia||af\n3|Yaoundé||af\n2|Bangui||af\n2|N'Djamena||af\n1|Moroni||af\n3|Brazzaville||af\n5|Kinshasa||af\n2|Djibouti/Djibouti City|Djibouti/Djibouti-ville|af\n8|Cairo|Le Caire|af\n1|Malabo||af\n1|Asmara||af\n1|Mbabane/Lobamba||af\n5|Addis Ababa|Addis-Abeba|af\n2|Libreville||af\n1|Banjul||af\n4|Accra||af\n2|Conakry||af\n1|Bissau||af\n2|Yamoussoukro||af\n6|Nairobi||af\n1|Maseru||af\n2|Monrovia||af\n4|Tripoli||af\n3|Antananarivo|Antananarivo/Tananarive|af\n2|Lilongwe||af\n3|Bamako||af\n2|Nouakchott||af\n2|Port Louis||af\n5|Rabat||af\n3|Maputo||af\n2|Windhoek||af\n2|Niamey||af\n4|Abuja||af\n3|Kigali||af\n1|São Tomé/Sao Tome||af\n5|Dakar||af\n2|Victoria||af\n2|Freetown||af\n3|Mogadishu|Mogadiscio|af\n5|Pretoria||af\n5|Cape Town|Le Cap|af\n2|Bloemfontein||af\n2|Juba||af\n3|Khartoum||af\n2|Dodoma||af\n2|Lomé||af\n5|Tunis||af\n3|Kampala||af\n2|Lusaka||af\n3|Harare||af\n4|Kabul|Kaboul|as\n3|Yerevan|Erevan|as eu\n3|Baku|Bakou|as eu\n2|Manama||as\n3|Dhaka||as\n2|Thimphu||as\n1|Bandar Seri Begawan||as\n3|Phnom Penh||as\n8|Beijing/Peking|Pékin/Beijing|as\n3|Nicosia|Nicosie|as eu\n3|Tbilisi||as eu\n7|New Delhi/Delhi||as\n5|Jakarta||as\n5|Tehran|Téhéran|as\n5|Baghdad|Bagdad|as\n5|Jerusalem|Jérusalem|as\n3|Amman||as\n3|Astana/Nur-Sultan||as eu\n2|Kuwait City|Koweït/Koweït City|as\n2|Bishkek|Bichkek|as\n2|Vientiane||as\n4|Beirut|Beyrouth|as\n5|Kuala Lumpur||as\n2|Malé||as\n3|Ulaanbaatar/Ulan Bator|Oulan-Bator|as\n2|Naypyidaw/Nay Pyi Taw||as\n4|Kathmandu|Katmandou|as\n5|Pyongyang||as\n2|Muscat|Mascate|as\n4|Islamabad||as\n2|Ramallah||as\n4|Doha||as\n8|Moscow|Moscou|as eu\n4|Riyadh|Riyad|as\n4|Singapore|Singapour|as\n7|Seoul|Séoul|as\n1|Sri Jayawardenepura Kotte/Kotte||as\n4|Damascus|Damas|as\n4|Taipei|Taipei/Taïpei|as\n2|Dushanbe|Douchanbé|as\n6|Bangkok||as\n1|Dili||as\n5|Ankara||as eu\n2|Ashgabat|Achgabat|as\n4|Abu Dhabi|Abou Dabi|as\n3|Tashkent|Tachkent|as\n5|Hanoi|Hanoï|as\n2|Sanaa/Sana'a||as\n9|Tokyo||as\n4|Manila|Manille|as\n3|Tirana||eu\n2|Andorra la Vella||eu\n6|Vienna|Vienne|eu\n3|Minsk||eu\n6|Brussels|Bruxelles|eu\n3|Sarajevo||eu\n4|Sofia||eu\n4|Zagreb||eu\n6|Prague||eu\n5|Copenhagen|Copenhague|eu\n3|Tallinn||eu\n5|Helsinki||eu\n9|Paris||eu\n8|Berlin||eu\n6|Athens|Athènes|eu\n6|Budapest||eu\n5|Reykjavik||eu\n6|Dublin||eu\n8|Rome||eu\n2|Pristina||eu\n3|Riga||eu\n2|Vaduz||eu\n3|Vilnius||eu\n3|Luxembourg/Luxembourg City|Luxembourg|eu\n2|Valletta|La Valette|eu\n2|Chișinău/Chisinau||eu\n3|Monaco||eu\n2|Podgorica||eu\n7|Amsterdam||eu\n2|Skopje||eu\n5|Oslo||eu\n5|Warsaw|Varsovie|eu\n6|Lisbon|Lisbonne|eu\n4|Bucharest|Bucarest|eu\n2|San Marino/City of San Marino|Saint-Marin|eu\n4|Belgrade||eu\n3|Bratislava||eu\n3|Ljubljana||eu\n8|Madrid||eu\n6|Stockholm||eu\n4|Bern/Berne|Berne|eu\n6|Kyiv/Kiev|Kiev/Kyiv|eu\n9|London|Londres|eu\n2|Vatican City/Vatican|Vatican/Cité du Vatican|eu\n5|Edinburgh|Édimbourg|eu\n3|Cardiff||eu\n3|Belfast||eu\n1|Saint John's/St. John's||na\n2|Nassau||na\n1|Bridgetown||na\n1|Belmopan||na\n6|Ottawa||na\n2|San José||na\n5|Havana|La Havane|na\n1|Roseau||na\n2|Santo Domingo|Saint-Domingue|na\n2|San Salvador||na\n1|Saint George's/St. George's||na\n2|Guatemala City|Guatemala/Ciudad de Guatemala|na\n3|Port-au-Prince||na\n2|Tegucigalpa||na\n3|Kingston||na\n6|Mexico City|Mexico|na\n2|Managua||na\n2|Panama City|Panama|na\n1|Basseterre||na\n1|Castries||na\n1|Kingstown||na\n2|Port of Spain|Port-d'Espagne|na\n8|Washington D.C./Washington/Washington DC||na\n7|Buenos Aires||sa\n3|Sucre||sa\n4|La Paz||sa\n5|Brasília||sa\n5|Santiago/Santiago de Chile||sa\n5|Bogotá||sa\n3|Quito||sa\n2|Georgetown||sa\n2|Asunción||sa\n5|Lima||sa\n1|Paramaribo||sa\n3|Montevideo||sa\n4|Caracas||sa\n6|Canberra||oc\n2|Suva||oc\n1|Tarawa/South Tarawa||oc\n1|Majuro||oc\n1|Palikir||oc\n1|Yaren||oc\n5|Wellington||oc\n1|Ngerulmud/Melekeok||oc\n2|Port Moresby||oc\n1|Apia||oc\n1|Honiara||oc\n1|Nuku'alofa||oc\n1|Funafuti||oc\n1|Port Vila||oc\n0|Sydney||no\n0|Melbourne||no\n0|Auckland||no\n0|Rio de Janeiro/Rio||no\n0|São Paulo/Sao Paulo||no\n0|New York/New York City/NYC||no\n0|Los Angeles||no\n0|Chicago||no\n0|Toronto||no\n0|Montreal|Montréal|no\n0|Vancouver||no\n0|Istanbul||no\n0|Dubai|Dubaï|no\n0|Mumbai/Bombay||no\n0|Shanghai||no\n0|Hong Kong||no\n0|Osaka||no\n0|Kyoto||no\n0|Barcelona|Barcelone|no\n0|Milan||no\n0|Venice|Venise|no\n0|Geneva|Genève|no\n0|Zurich||no\n0|Munich||no\n0|Marseille||no\n0|Lyon||no\n0|Nice||no\n0|Saint Petersburg|Saint-Pétersbourg|no\n0|Casablanca||no\n0|Lagos||no\n0|Johannesburg||no\n0|Alexandria|Alexandrie|no\n0|Karachi||no\n0|Almaty||no\n0|Dar es Salaam||no\n0|Abidjan||no\n0|Bujumbura||no\n0|Colombo||no\n0|Tel Aviv||no\n0|The Hague|La Haye|no\n0|Rotterdam||no\n0|Antwerp|Anvers|no\n0|Porto||no\n0|Kraków/Krakow|Cracovie|no\n0|Glasgow||no\n0|Manchester||no\n0|Seville|Séville|no"},"us_states":{"z":1,"d":[],"e":"5|Alabama||\n7|Alaska||\n5|Arizona||\n4|Arkansas||\n9|California|Californie|\n5|Colorado||\n3|Connecticut||\n3|Delaware||\n8|Florida|Floride|\n5|Georgia|Géorgie|\n7|Hawaii|Hawaï|\n3|Idaho||\n5|Illinois||\n4|Indiana||\n3|Iowa||\n4|Kansas||\n4|Kentucky||\n5|Louisiana|Louisiane|\n3|Maine||\n3|Maryland||\n5|Massachusetts||\n5|Michigan||\n4|Minnesota||\n4|Mississippi||\n4|Missouri||\n4|Montana||\n3|Nebraska||\n6|Nevada||\n3|New Hampshire||\n4|New Jersey||\n4|New Mexico|Nouveau-Mexique|\n8|New York/New York State|New York/État de New York|\n4|North Carolina|Caroline du Nord|\n3|North Dakota|Dakota du Nord|\n5|Ohio||\n4|Oklahoma||\n4|Oregon||\n4|Pennsylvania|Pennsylvanie|\n3|Rhode Island||\n3|South Carolina|Caroline du Sud|\n3|South Dakota|Dakota du Sud|\n4|Tennessee||\n9|Texas||\n4|Utah||\n3|Vermont||\n4|Virginia|Virginie|\n6|Washington/Washington State|Washington/État de Washington|\n3|West Virginia|Virginie-Occidentale|\n3|Wisconsin||\n3|Wyoming||\n0|Puerto Rico|Porto Rico|no\n0|District of Columbia/DC/Washington DC||no\n0|Guam||no\n0|Los Angeles||no\n0|Chicago||no\n0|Miami||no\n0|Las Vegas||no\n0|Dakota||no\n0|Carolina|Caroline|no"},"landmarks":{"z":1,"d":[],"e":"9|Eiffel Tower|Tour Eiffel|\n8|Statue of Liberty|Statue de la Liberté|\n8|Great Wall of China/Great Wall|Grande Muraille de Chine/Grande Muraille/Muraille de Chine|\n8|Pyramids of Giza/Great Pyramid/Pyramids/Great Pyramid of Giza|Pyramides de Gizeh/Grande Pyramide/Pyramides/Pyramide de Khéops|\n8|Colosseum/Coliseum|Colisée|\n8|Big Ben/Elizabeth Tower||\n8|Taj Mahal||\n7|Leaning Tower of Pisa/Tower of Pisa|Tour de Pise/Tour penchée de Pise|\n7|Machu Picchu||\n7|Christ the Redeemer|Christ Rédempteur|\n7|Sydney Opera House|Opéra de Sydney|\n7|Arc de Triomphe||\n7|Stonehenge||\n6|Louvre/Louvre Museum|Louvre/Musée du Louvre|\n6|Notre-Dame/Notre-Dame de Paris/Notre Dame|Notre-Dame/Notre-Dame de Paris|\n6|Golden Gate Bridge/Golden Gate|Pont du Golden Gate/Golden Gate|\n6|Empire State Building||\n6|Mount Rushmore|Mont Rushmore|\n6|Burj Khalifa||\n6|Sagrada Família/Sagrada Familia||\n6|Acropolis|Acropole|\n6|Parthenon|Parthénon|\n6|Petra|Pétra|\n6|Chichen Itza||\n6|Angkor Wat||\n6|Kremlin||\n6|Red Square|Place Rouge|\n6|Tower Bridge||\n6|Tower of London|Tour de Londres|\n6|Buckingham Palace|Palais de Buckingham|\n6|Palace of Versailles/Versailles|Château de Versailles/Versailles|\n6|Mont-Saint-Michel/Mont Saint-Michel||\n6|Sphinx/Great Sphinx|Sphinx/Grand Sphinx|\n5|Neuschwanstein/Neuschwanstein Castle|Château de Neuschwanstein|\n5|Brandenburg Gate|Porte de Brandebourg|\n5|Berlin Wall|Mur de Berlin|\n5|Alhambra||\n5|Hagia Sophia|Sainte-Sophie/Basilique Sainte-Sophie|\n5|Blue Mosque|Mosquée bleue|\n5|Trevi Fountain|Fontaine de Trevi|\n5|St. Peter's Basilica/Saint Peter's Basilica|Basilique Saint-Pierre|\n5|Sistine Chapel|Chapelle Sixtine|\n5|Pantheon|Panthéon|\n5|Forbidden City|Cité interdite|\n5|Terracotta Army|Armée de terre cuite|\n5|Easter Island statues/Moai|Moaï/Statues de l'île de Pâques|\n5|London Eye||\n5|Westminster Abbey|Abbaye de Westminster|\n5|Times Square||\n5|Central Park||\n5|White House|Maison-Blanche|\n5|Hollywood Sign|Panneau Hollywood|\n5|Space Needle||\n5|CN Tower|Tour CN|\n5|Niagara Falls|Chutes du Niagara|\n5|Grand Canyon||\n5|Golden Temple|Temple d'or|\n5|Petronas Towers|Tours Petronas|\n5|Marina Bay Sands||\n5|Burj Al Arab||\n5|Kaaba||\n5|Western Wall/Wailing Wall|Mur des Lamentations|\n5|Dome of the Rock|Dôme du Rocher|\n5|Abu Simbel||\n5|Valley of the Kings|Vallée des Rois|\n3|Atomium||\n3|Manneken Pis||\n3|Little Mermaid|Petite Sirène|\n2|Charles Bridge|Pont Charles|\n2|Rialto Bridge|Pont du Rialto|\n2|St. Mark's Basilica/Saint Mark's Basilica|Basilique Saint-Marc|\n2|Doge's Palace|Palais des Doges|\n2|Duomo/Florence Cathedral|Duomo/Cathédrale de Florence|\n2|Milan Cathedral|Cathédrale de Milan/Duomo de Milan|\n2|Ponte Vecchio||\n4|Pompeii|Pompéi|\n2|Château de Chambord/Chambord||\n4|Sacré-Cœur/Sacre Coeur|Sacré-Cœur/Basilique du Sacré-Cœur|\n3|Pont du Gard||\n3|Centre Pompidou/Pompidou Centre|Centre Pompidou/Beaubourg|\n2|Musée d'Orsay/Orsay Museum|Musée d'Orsay|\n2|Grand Palais||\n2|Opéra Garnier/Palais Garnier||\n2|Les Invalides|Les Invalides/Hôtel des Invalides|\n2|La Défense||\n4|Champs-Élysées/Champs Elysees||\n3|Carcassonne/Cité de Carcassonne|Cité de Carcassonne|\n3|Millau Viaduct|Viaduc de Millau|\n3|Edinburgh Castle|Château d'Édimbourg|\n2|Windsor Castle|Château de Windsor|\n3|Hadrian's Wall|Mur d'Hadrien|\n3|Giant's Causeway|Chaussée des Géants|\n2|Cliffs of Moher|Falaises de Moher|\n2|Cologne Cathedral|Cathédrale de Cologne|\n2|Belém Tower/Tower of Belém|Tour de Belém|\n2|Park Güell/Parc Güell|Parc Güell|\n2|Guggenheim Museum/Guggenheim|Musée Guggenheim/Guggenheim|\n2|Prado/Prado Museum|Musée du Prado/Prado|\n2|Meteora|Météores|\n2|Delphi|Delphes|\n2|Knossos|Cnossos|\n2|Ephesus|Éphèse|\n2|Cappadocia|Cappadoce|\n2|Saint Basil's Cathedral/St. Basil's Cathedral|Cathédrale Saint-Basile|\n2|Hermitage Museum/Hermitage|Musée de l'Ermitage/Ermitage|\n2|Peterhof||\n2|Hallgrímskirkja||\n3|Mount Fuji|Mont Fuji|\n2|Tokyo Tower|Tour de Tokyo|\n2|Tokyo Skytree||\n2|Itsukushima Shrine/Floating Torii|Sanctuaire d'Itsukushima|\n2|Fushimi Inari||\n2|Himeji Castle|Château de Himeji|\n2|Kinkaku-ji/Golden Pavilion|Kinkaku-ji/Pavillon d'or|\n2|Potala Palace|Palais du Potala|\n2|Summer Palace|Palais d'été|\n2|Temple of Heaven|Temple du Ciel|\n2|Oriental Pearl Tower|Perle de l'Orient|\n2|Borobudur||\n2|Gateway of India|Porte de l'Inde|\n2|Red Fort|Fort Rouge|\n2|Lotus Temple|Temple du Lotus|\n2|Hampi||\n2|Sigiriya||\n2|Shwedagon Pagoda|Pagode Shwedagon|\n2|Bagan||\n3|Ha Long Bay/Halong Bay|Baie d'Along/Baie d'Ha Long|\n2|Wat Arun||\n2|Grand Palace|Grand Palais de Bangkok|\n2|Sheikh Zayed Mosque/Sheikh Zayed Grand Mosque|Grande mosquée Sheikh Zayed|\n2|Persepolis|Persépolis|\n2|Baalbek||\n2|Göbekli Tepe||\n3|Table Mountain|Montagne de la Table|\n4|Victoria Falls|Chutes Victoria|\n2|Great Mosque of Djenné/Djenné|Grande mosquée de Djenné|\n2|Hassan II Mosque|Mosquée Hassan-II|\n2|Carthage||\n2|Timbuktu|Tombouctou|\n2|Great Zimbabwe|Grand Zimbabwe|\n2|Lalibela||\n3|Kilimanjaro||\n4|Uluru/Ayers Rock||\n3|Sydney Harbour Bridge|Harbour Bridge|\n4|Great Barrier Reef|Grande Barrière de corail|\n2|Hobbiton||\n2|Lincoln Memorial||\n3|Washington Monument||\n3|Capitol/United States Capitol|Capitole|\n3|Pentagon|Pentagone|\n3|Alcatraz||\n3|Brooklyn Bridge|Pont de Brooklyn|\n2|Chrysler Building||\n2|One World Trade Center/Freedom Tower||\n2|Rockefeller Center||\n2|Gateway Arch||\n3|Hoover Dam|Barrage Hoover|\n3|Yellowstone||\n2|Yosemite||\n2|Las Vegas Strip/The Strip||\n2|Walk of Fame|Hollywood Walk of Fame|\n4|Disneyland||\n2|Chateau Frontenac/Château Frontenac|Château Frontenac|\n2|Teotihuacan|Teotihuacán|\n2|Tikal||\n3|Panama Canal|Canal de Panama|\n3|Iguazu Falls|Chutes d'Iguazú|\n2|Angel Falls|Salto Ángel|\n2|Sugarloaf Mountain|Pain de Sucre|\n2|Copacabana||\n3|Nazca Lines|Lignes de Nazca|\n2|Galápagos||\n3|Suez Canal|Canal de Suez|\n3|Channel Tunnel|Tunnel sous la Manche|\n3|Matterhorn|Cervin|\n2|Château de Chenonceau/Chenonceau|Chenonceau|\n3|Lascaux||\n3|Hall of Mirrors|Galerie des Glaces|\n2|Place de la Concorde||\n2|Luxor Temple|Temple de Louxor|\n2|Karnak||\n2|Rock of Gibraltar|Rocher de Gibraltar|\n2|Kinderdijk||\n3|Rijksmuseum||\n3|Anne Frank House|Maison d'Anne Frank|\n2|Alcázar of Seville|Alcazar de Séville|\n2|Plaza Mayor||\n2|Royal Palace of Madrid|Palais royal de Madrid|\n2|Schönbrunn Palace|Château de Schönbrunn|\n2|St. Stephen's Cathedral|Cathédrale Saint-Étienne de Vienne|\n2|Hungarian Parliament|Parlement hongrois|\n2|Wawel Castle|Château du Wawel|\n3|Auschwitz||\n2|Bran Castle|Château de Bran|\n2|Dubrovnik Old Town/Dubrovnik|Dubrovnik|\n2|Plitvice Lakes|Lacs de Plitvice|\n2|Blue Lagoon|Lagon bleu|\n0|Paris||no\n0|London|Londres|no"},"languages":{"z":1,"d":[],"e":"9|English|Anglais|\n9|French|Français|\n9|Spanish|Espagnol|\n8|Chinese/Mandarin/Mandarin Chinese|Chinois/Mandarin|\n8|German|Allemand|\n8|Italian|Italien|\n8|Arabic|Arabe|\n8|Japanese|Japonais|\n7|Portuguese|Portugais|\n7|Russian|Russe|\n6|Hindi||\n6|Korean|Coréen|\n5|Dutch|Néerlandais/Hollandais|\n5|Greek|Grec|\n5|Latin||\n5|Turkish|Turc|\n5|Swedish|Suédois|\n5|Polish|Polonais|\n5|Hebrew|Hébreu|\n4|Norwegian|Norvégien|\n4|Danish|Danois|\n4|Finnish|Finnois|\n4|Cantonese|Cantonais|\n4|Bengali||\n4|Urdu|Ourdou|\n4|Persian/Farsi|Persan/Farsi|\n4|Vietnamese|Vietnamien|\n4|Thai|Thaï|\n4|Indonesian|Indonésien|\n4|Swahili||\n4|Ukrainian|Ukrainien|\n4|Romanian|Roumain|\n4|Hungarian|Hongrois|\n4|Czech|Tchèque|\n4|Irish/Irish Gaelic/Gaelic|Irlandais/Gaélique|\n4|Welsh|Gallois|\n4|Esperanto|Espéranto|\n4|Breton||\n4|Basque||\n4|Catalan||\n4|Corsican|Corse|\n4|Occitan||\n4|Alsatian|Alsacien|\n3|Scottish Gaelic|Gaélique écossais|\n3|Icelandic|Islandais|\n3|Croatian|Croate|\n3|Serbian|Serbe|\n3|Bulgarian|Bulgare|\n3|Slovak|Slovaque|\n3|Slovenian|Slovène|\n3|Lithuanian|Lituanien|\n3|Latvian|Letton|\n3|Estonian|Estonien|\n3|Albanian|Albanais|\n3|Macedonian|Macédonien|\n3|Bosnian|Bosnien|\n3|Maltese|Maltais|\n3|Luxembourgish|Luxembourgeois|\n3|Galician|Galicien|\n3|Flemish|Flamand|\n3|Afrikaans||\n3|Zulu|Zoulou|\n3|Xhosa||\n3|Yoruba||\n3|Igbo||\n3|Hausa|Haoussa|\n3|Amharic|Amharique|\n3|Somali||\n3|Berber/Tamazight|Berbère/Tamazight|\n3|Wolof||\n3|Lingala||\n3|Malagasy|Malgache|\n3|Tamil|Tamoul|\n3|Telugu|Télougou|\n3|Punjabi|Pendjabi|\n3|Marathi||\n3|Gujarati|Goudjarati|\n3|Kannada||\n3|Malayalam||\n3|Nepali|Népalais|\n3|Sanskrit||\n3|Tagalog/Filipino||\n3|Malay|Malais|\n3|Khmer||\n3|Lao|Lao/Laotien|\n3|Burmese|Birman|\n3|Mongolian|Mongol|\n3|Tibetan|Tibétain|\n3|Uyghur|Ouïghour|\n3|Kazakh||\n3|Uzbek|Ouzbek|\n3|Armenian|Arménien|\n3|Georgian|Géorgien|\n3|Azerbaijani|Azéri|\n3|Kurdish|Kurde|\n3|Pashto|Pachto|\n3|Yiddish||\n3|Hawaiian|Hawaïen|\n3|Maori||\n3|Samoan||\n3|Tongan|Tongien|\n3|Fijian|Fidjien|\n3|Quechua||\n3|Guarani||\n3|Aymara||\n3|Nahuatl||\n3|Mayan/Maya|Maya|\n3|Navajo||\n3|Cherokee||\n3|Inuktitut||\n3|Greenlandic|Groenlandais|\n3|Sami|Same|\n3|Faroese|Féroïen|\n3|Creole/Haitian Creole|Créole/Créole haïtien|\n3|Sign language/British Sign Language/American Sign Language|Langue des signes|\n2|Cornish|Cornique|\n2|Manx|Mannois|\n2|Frisian|Frison|\n2|Sardinian|Sarde|\n2|Sicilian|Sicilien|\n2|Romansh|Romanche|\n2|Provençal||\n2|Picard||\n2|Walloon|Wallon|\n2|Ladino||\n2|Belarusian|Biélorusse|\n2|Moldovan|Moldave|\n2|Chechen|Tchétchène|\n2|Tatar||\n2|Ossetian|Ossète|\n2|Aramaic|Araméen|\n2|Coptic|Copte|\n2|Ancient Egyptian/Egyptian hieroglyphs|Égyptien ancien|\n2|Sumerian|Sumérien|\n2|Akkadian|Akkadien|\n2|Old Norse|Vieux norrois|\n2|Old English/Anglo-Saxon|Vieil anglais|\n2|Gothic|Gotique|\n2|Etruscan|Étrusque|\n2|Tigrinya|Tigrigna|\n2|Oromo||\n2|Kinyarwanda||\n2|Kirundi||\n2|Shona||\n2|Sesotho/Sotho||\n2|Tswana/Setswana||\n2|Fula/Fulani|Peul|\n2|Bambara||\n2|Twi/Akan||\n2|Ewe|Éwé|\n2|Sinhala|Cinghalais|\n2|Dhivehi|Divehi|\n2|Javanese|Javanais|\n2|Sundanese|Soundanais|\n2|Balinese|Balinais|\n2|Cebuano||\n2|Hmong||\n2|Dzongkha||\n2|Tajik|Tadjik|\n2|Turkmen|Turkmène|\n2|Kyrgyz|Kirghiz|\n2|Klingon||\n2|Elvish/Sindarin/Quenya|Elfique|\n2|Tok Pisin||\n2|Bislama||\n2|Papiamento||\n2|Hokkien||\n2|Wu/Shanghainese|Wu/Shanghaïen|\n2|Hakka||\n2|Ainu/Aïnou|Aïnou|\n0|Latin American|Latino|no\n0|American|Américain|no\n0|Mexican|Mexicain|no\n0|Brazilian|Brésilien|no\n0|Indian|Indien|no\n0|Swiss|Suisse|no\n0|Belgian|Belge|no\n0|Austrian|Autrichien|no\n0|Canadian|Canadien|no\n0|Australian|Australien|no\n0|Python||no\n0|JavaScript||no"},"currencies":{"z":1,"d":[],"e":"9|Euro||\n9|Dollar/US Dollar|Dollar/Dollar américain|\n8|Pound/Pound sterling/British pound|Livre/Livre sterling|\n8|Yen||\n6|Swiss franc|Franc suisse|\n6|Franc||\n6|Ruble/Rouble|Rouble|\n6|Yuan/Renminbi||\n6|Rupee/Indian rupee|Roupie/Roupie indienne|\n5|Canadian dollar|Dollar canadien|\n5|Australian dollar|Dollar australien|\n5|Peso||\n5|Mexican peso|Peso mexicain|\n5|Real/Brazilian real|Réal/Réal brésilien|\n5|Won||\n5|Krone/Krona/Crown|Couronne|\n5|Lira/Turkish lira|Livre turque|\n5|Dirham||\n5|Dinar||\n5|Riyal/Rial||\n5|Bitcoin||\n5|Italian lira|Lire/Lire italienne|\n4|Mark/Deutsche Mark/Deutschmark|Mark/Deutsche Mark|\n4|Peseta||\n3|Drachma|Drachme|\n3|Escudo||\n3|Guilder/Florin|Florin|\n3|Shekel/New shekel|Shekel/Nouveau shekel|\n3|Rand||\n3|Naira||\n3|Shilling||\n3|Zloty/Złoty||\n3|Forint||\n3|Koruna/Czech koruna|Couronne tchèque|\n2|Leu||\n2|Lev||\n2|Hryvnia||\n2|Kuna||\n3|Baht||\n3|Ringgit||\n3|Rupiah|Roupie indonésienne|\n3|Dong||\n2|Taka||\n2|Kip||\n2|Riel||\n2|Kyat||\n2|Tugrik/Tögrög|Tugrik|\n2|Tenge||\n2|Som||\n2|Manat||\n2|Lari||\n2|Dram||\n2|Afghani||\n2|Iranian rial|Rial iranien|\n2|Egyptian pound|Livre égyptienne|\n3|CFA franc/West African CFA franc|Franc CFA|\n2|CFP franc|Franc CFP|\n2|Cedi||\n2|Birr||\n2|Kwacha||\n2|Kwanza||\n2|Ariary||\n2|Pula||\n2|Loti||\n2|Lilangeni||\n2|Dalasi||\n2|Leone||\n2|Ouguiya||\n2|Nakfa||\n3|Bolívar/Bolivar|Bolivar|\n2|Boliviano||\n3|Sol/Nuevo sol|Sol|\n2|Guaraní|Guarani|\n2|Colón/Colon|Colón|\n2|Quetzal||\n2|Lempira||\n2|Córdoba/Cordoba|Córdoba|\n2|Balboa||\n2|Gourde||\n3|New Zealand dollar/Kiwi dollar|Dollar néo-zélandais|\n3|Singapore dollar|Dollar de Singapour|\n3|Hong Kong dollar|Dollar de Hong Kong|\n2|Taiwan dollar/New Taiwan dollar|Dollar de Taïwan|\n2|Kina||\n2|Pa'anga/Paanga||\n2|Tala||\n2|Vatu||\n2|Rufiyaa||\n2|Ngultrum||\n2|Denar||\n2|Convertible mark|Mark convertible|\n3|Ecu/ECU|Écu|\n3|Louis d'or||\n3|Sestertius|Sesterce|\n3|Denarius|Denier|\n3|Ducat||\n3|Doubloon|Doublon|\n3|Ethereum/Ether||\n3|Dogecoin||\n2|Sou||\n2|Livre tournois||\n2|Thaler/Taler|Thaler|\n2|Groat||\n2|Farthing||\n2|Guinea|Guinée|\n0|Cent|Centime|no\n0|Penny||no\n0|Coin|Pièce|no\n0|Money|Argent|no\n0|Gold|Or|no"},"cities":{"z":1,"d":[],"e":"9|Paris||fr\n8|Marseille/Marseilles||fr\n8|Lyon/Lyons||fr\n7|Toulouse||fr\n7|Nice||fr\n6|Nantes||fr\n6|Strasbourg||fr\n6|Montpellier||fr\n6|Bordeaux||fr\n6|Lille||fr\n5|Rennes||fr\n4|Reims||fr\n4|Le Havre||fr\n4|Saint-Étienne/Saint Etienne||fr\n4|Toulon||fr\n4|Grenoble||fr\n4|Dijon||fr\n4|Angers||fr\n3|Nîmes||fr\n3|Villeurbanne||fr\n3|Clermont-Ferrand||fr\n3|Le Mans||fr\n4|Aix-en-Provence||fr\n4|Brest||fr\n3|Tours||fr\n3|Amiens||fr\n3|Limoges||fr\n3|Annecy||fr\n3|Perpignan||fr\n3|Boulogne-Billancourt||fr\n3|Metz||fr\n3|Besançon||fr\n3|Orléans||fr\n2|Saint-Denis||fr\n2|Argenteuil||fr\n4|Rouen||fr\n3|Mulhouse||fr\n3|Caen||fr\n3|Nancy||fr\n2|Montreuil||fr\n2|Roubaix||fr\n2|Tourcoing||fr\n2|Nanterre||fr\n2|Vitry-sur-Seine||fr\n2|Créteil||fr\n4|Avignon||fr\n2|Poitiers||fr\n2|Aubervilliers||fr\n2|Versailles||fr\n5|Cannes||fr\n3|Antibes||fr\n2|Colombes||fr\n2|Asnières-sur-Seine||fr\n2|Courbevoie||fr\n2|Pau||fr\n3|La Rochelle||fr\n2|Calais||fr\n2|Dunkirk|Dunkerque|fr\n2|Béziers||fr\n2|Bourges||fr\n2|Saint-Malo||fr\n3|Ajaccio||fr\n2|Bastia||fr\n3|Biarritz||fr\n2|Bayonne||fr\n2|Lorient||fr\n2|Vannes||fr\n2|Quimper||fr\n2|Valence||fr\n2|Troyes||fr\n2|Chartres||fr\n2|Colmar||fr\n2|Arles||fr\n2|Carcassonne||fr\n2|Lourdes||fr\n2|Chamonix||fr\n2|Saint-Tropez||fr\n2|Menton||fr\n2|Cherbourg||fr\n2|Angoulême||fr\n2|Niort||fr\n2|Laval||fr ca\n2|Le Mont-Saint-Michel/Mont-Saint-Michel||fr\n1|Saint-Nazaire||fr\n1|Saint-Quentin||fr\n1|Beauvais||fr\n1|Cholet||fr\n1|Chambéry||fr\n1|Montauban||fr\n1|Narbonne||fr\n1|Sète||fr\n1|Fréjus||fr\n1|Hyères||fr\n1|Cayenne||fr\n1|Fort-de-France||fr\n1|Pointe-à-Pitre||fr\n1|Nouméa||fr\n1|Papeete||fr\n1|Vichy||fr\n1|Épinal||fr\n1|Auxerre||fr\n1|Évian-les-Bains/Evian||fr\n1|Deauville||fr\n1|Lens||fr\n1|Arras||fr\n1|Mâcon||fr\n1|Albi||fr\n1|Rodez||fr\n1|Périgueux||fr\n1|Agen||fr\n1|Tarbes||fr\n1|Gap||fr\n1|Sedan||fr\n1|Verdun||fr\n9|New York/New York City/NYC||us\n8|Los Angeles/LA||us\n7|Chicago||us\n6|Houston||us\n5|Phoenix||us\n5|Philadelphia|Philadelphie|us\n4|San Antonio||us\n5|San Diego||us\n5|Dallas||us\n4|San Jose||us\n3|Austin||us\n3|Jacksonville||us\n3|Fort Worth||us\n3|Columbus||us\n3|Charlotte||us\n7|San Francisco||us\n5|Seattle||us\n4|Denver||us\n7|Washington/Washington DC/Washington D.C.||us\n5|Boston||us\n4|Nashville||us\n5|Detroit||us\n3|Oklahoma City||us\n3|Portland||us\n7|Las Vegas||us\n3|Memphis||us\n3|Louisville||us\n3|Baltimore||us\n3|Milwaukee||us\n3|Albuquerque||us\n3|Tucson||us\n2|Fresno||us\n2|Sacramento||us\n2|Kansas City||us\n6|Miami||us\n6|Atlanta||us\n2|Omaha||us\n2|Raleigh||us\n2|Minneapolis||us\n2|Cleveland||us\n2|Tulsa||us\n2|Arlington||us\n4|New Orleans|La Nouvelle-Orléans|us\n2|Wichita||us\n3|Tampa||us\n3|Honolulu||us\n3|Anchorage||us\n3|Orlando||us\n3|Pittsburgh||us\n3|Cincinnati||us\n2|St. Louis/Saint Louis||us\n2|Salt Lake City||us\n2|Buffalo||us\n2|Indianapolis||us\n2|Richmond||us\n2|Boise||us\n2|Spokane||us\n2|Des Moines||us\n2|Birmingham||us uk\n2|Rochester||us\n2|Madison||us\n2|Reno||us\n2|Savannah||us\n2|Charleston||us\n2|Hartford||us\n2|Providence||us\n2|Santa Fe||us\n2|Dayton||us\n2|Toledo||us es\n2|Akron||us\n2|Little Rock||us\n2|Montgomery||us\n1|Juneau||us\n2|Hollywood||us\n2|Malibu||us\n2|Beverly Hills||us\n2|Palm Springs||us\n1|Key West||us\n1|Fort Lauderdale||us\n1|Jersey City||us\n1|Newark||us\n1|Oakland||us\n1|Long Beach||us\n1|Santa Barbara||us\n1|Berkeley||us\n1|Pasadena||us\n1|Anaheim||us\n1|El Paso||us\n1|Corpus Christi||us\n1|Lexington||us\n1|Knoxville||us\n1|Chattanooga||us\n1|Albany||us\n1|Annapolis||us\n1|Topeka||us\n1|Lincoln||us\n1|Cheyenne||us\n1|Fargo||us\n1|Bismarck||us\n1|Helena||us\n1|Olympia||us\n1|Burlington||us\n1|Augusta||us\n1|Trenton||us\n1|Dover||us uk\n9|London|Londres|uk\n6|Manchester||uk\n5|Liverpool||uk\n5|Edinburgh|Édimbourg|uk\n5|Glasgow||uk\n4|Leeds||uk\n3|Sheffield||uk\n3|Bristol||uk\n4|Cardiff||uk\n3|Belfast||uk\n3|Newcastle/Newcastle upon Tyne||uk\n4|Oxford||uk\n4|Cambridge||uk\n2|Nottingham||uk\n2|Leicester||uk\n2|Coventry||uk\n2|Bradford||uk\n2|Southampton||uk\n2|Portsmouth||uk\n3|Brighton||uk\n2|Plymouth||uk\n2|Aberdeen||uk\n2|Dundee||uk\n2|Swansea||uk\n2|York||uk\n3|Bath||uk\n2|Canterbury||uk\n2|Norwich||uk\n2|Exeter||uk\n2|Reading||uk\n2|Stoke-on-Trent||uk\n2|Wolverhampton||uk\n2|Derby||uk\n2|Sunderland||uk\n2|Hull/Kingston upon Hull||uk\n2|Blackpool||uk\n1|Inverness||uk\n1|Stirling||uk\n1|Perth||uk\n1|Derry/Londonderry||uk\n1|Chester||uk\n1|Durham||uk\n1|Lancaster||uk\n1|Preston||uk\n1|Bolton||uk\n1|Middlesbrough||uk\n1|Luton||uk\n1|Milton Keynes||uk\n1|Ipswich||uk\n1|Peterborough||uk\n1|Gloucester||uk\n1|Worcester||uk\n1|Salisbury||uk\n1|Winchester||uk\n1|Bournemouth||uk\n1|Swindon||uk\n1|Northampton||uk\n1|Wigan||uk\n1|Watford||uk\n1|Stratford-upon-Avon||uk\n9|Rome||it\n8|Milan||it\n7|Venice|Venise|it\n7|Florence||it\n6|Naples||it\n5|Turin||it\n4|Pisa|Pise|it\n4|Bologna|Bologne|it\n4|Genoa|Gênes|it\n4|Palermo|Palerme|it\n4|Verona|Vérone|it\n3|Bari||it\n3|Catania|Catane|it\n2|Messina|Messine|it\n2|Padua|Padoue|it\n2|Trieste||it\n2|Brescia||it\n2|Parma|Parme|it\n2|Modena|Modène|it\n2|Perugia|Pérouse|it\n2|Cagliari||it\n2|Livorno/Leghorn|Livourne|it\n2|Siena|Sienne|it\n2|Bergamo|Bergame|it\n2|Como|Côme|it\n2|Lucca|Lucques|it\n2|Ravenna|Ravenne|it\n2|Rimini||it\n2|Salerno|Salerne|it\n2|Sorrento|Sorrente|it\n2|Amalfi||it\n1|Assisi|Assise|it\n1|Mantua|Mantoue|it\n1|Ferrara|Ferrare|it\n1|Pompeii|Pompéi|it\n1|Syracuse/Siracusa||it us\n1|Taranto|Tarente|it\n1|Reggio Calabria/Reggio di Calabria|Reggio de Calabre|it\n1|Ancona|Ancône|it\n1|Pescara||it\n1|Trento|Trente|it\n1|Bolzano||it\n1|Udine||it\n1|Vicenza|Vicence|it\n1|Treviso|Trévise|it\n1|Lecce||it\n1|Matera||it\n1|Sanremo/San Remo||it\n1|Piacenza|Plaisance|it\n1|Reggio Emilia||it\n1|Cremona|Crémone|it\n1|Aosta|Aoste|it\n1|Urbino||it\n1|Pavia|Pavie|it\n1|Novara|Novare|it\n1|Monza||it\n1|Foggia||it\n1|Capri||it\n9|Madrid||es\n8|Barcelona|Barcelone|es\n6|Seville|Séville|es\n6|Valencia||es\n4|Málaga||es\n4|Bilbao||es\n4|Granada|Grenade|es\n3|Zaragoza|Saragosse|es\n3|Palma/Palma de Mallorca||es\n3|Ibiza||es\n3|San Sebastián/Donostia|Saint-Sébastien|es\n3|Córdoba/Cordoba|Cordoue|es\n2|Alicante||es\n2|Murcia|Murcie|es\n2|Valladolid||es\n2|Vigo||es\n2|Gijón||es\n2|A Coruña/La Coruña/Corunna|La Corogne|es\n2|Pamplona|Pampelune|es\n2|Santander||es\n2|Salamanca|Salamanque|es\n2|Santiago de Compostela|Saint-Jacques-de-Compostelle|es\n2|Cádiz/Cadiz|Cadix|es\n2|Marbella||es\n2|Benidorm||es\n2|Las Palmas/Las Palmas de Gran Canaria||es\n1|Santa Cruz de Tenerife||es\n1|Segovia|Ségovie|es\n1|Burgos||es\n1|León||es\n1|Oviedo||es\n1|Tarragona|Tarragone|es\n1|Girona/Gerona|Gérone|es\n1|Lleida/Lérida||es\n1|Almería||es\n1|Huelva||es\n1|Jerez/Jerez de la Frontera|Xérès|es\n1|Mérida||es\n1|Cáceres||es\n1|Badajoz||es\n1|Logroño||es\n1|Vitoria/Vitoria-Gasteiz||es\n1|Albacete||es\n1|Elche||es\n1|Cartagena|Carthagène|es\n1|Ávila||es\n1|Cuenca||es\n1|Ronda||es\n9|Berlin||de\n8|Munich/München|Munich|de\n6|Hamburg|Hambourg|de\n6|Frankfurt|Francfort|de\n5|Cologne/Köln|Cologne|de\n4|Stuttgart||de\n4|Düsseldorf||de\n4|Dortmund||de\n3|Leipzig||de\n3|Dresden|Dresde|de\n3|Bremen|Brême|de\n3|Hanover/Hannover|Hanovre|de\n3|Nuremberg/Nürnberg|Nuremberg|de\n2|Essen||de\n2|Duisburg||de\n2|Bochum||de\n2|Wuppertal||de\n2|Bonn||de\n2|Bielefeld||de\n2|Mannheim||de\n2|Karlsruhe||de\n2|Münster||de\n2|Augsburg|Augsbourg|de\n2|Wiesbaden||de\n2|Gelsenkirchen||de\n2|Mönchengladbach||de\n2|Aachen|Aix-la-Chapelle|de\n2|Kiel||de\n2|Freiburg/Freiburg im Breisgau|Fribourg-en-Brisgau|de\n2|Heidelberg||de\n2|Mainz|Mayence|de\n2|Rostock||de\n2|Potsdam||de\n2|Lübeck||de\n2|Kassel||de\n2|Erfurt||de\n1|Magdeburg|Magdebourg|de\n1|Halle||de\n1|Chemnitz||de\n1|Brunswick/Braunschweig|Brunswick|de\n1|Saarbrücken|Sarrebruck|de\n1|Trier|Trèves|de\n1|Koblenz|Coblence|de\n1|Regensburg|Ratisbonne|de\n1|Würzburg||de\n1|Ulm||de\n1|Wolfsburg||de\n1|Ingolstadt||de\n1|Leverkusen||de\n1|Oldenburg||de\n1|Osnabrück||de\n1|Göttingen||de\n1|Darmstadt||de\n1|Jena/Iéna|Iéna|de\n1|Weimar||de\n1|Bamberg||de\n1|Baden-Baden||de\n1|Garmisch-Partenkirchen||de\n9|Tokyo||jp\n8|Kyoto||jp\n7|Osaka||jp\n6|Hiroshima||jp\n5|Nagasaki||jp\n4|Yokohama||jp\n4|Nagoya||jp\n4|Sapporo||jp\n4|Kobe||jp\n3|Fukuoka||jp\n3|Nara||jp\n3|Kawasaki||jp\n3|Sendai||jp\n2|Okinawa/Naha||jp\n2|Kagoshima||jp\n2|Kitakyushu||jp\n2|Saitama||jp\n2|Chiba||jp\n2|Niigata||jp\n2|Shizuoka||jp\n2|Kumamoto||jp\n2|Okayama||jp\n2|Kanazawa||jp\n2|Nikko||jp\n2|Hakone||jp\n1|Matsuyama||jp\n1|Hakodate||jp\n1|Nagano||jp\n1|Kamakura||jp\n1|Himeji||jp\n1|Takayama||jp\n1|Gifu||jp\n1|Wakayama||jp\n1|Toyota||jp\n1|Kochi||jp\n1|Akita||jp\n1|Aomori||jp\n1|Fukushima||jp\n1|Hamamatsu||jp\n1|Utsunomiya||jp\n8|Toronto||ca\n8|Montreal|Montréal|ca\n7|Vancouver||ca\n6|Ottawa||ca\n6|Quebec City/Quebec|Québec|ca\n5|Calgary||ca\n4|Edmonton||ca\n3|Winnipeg||ca\n3|Halifax||ca\n3|Victoria||ca\n2|Hamilton||ca\n2|Regina||ca\n2|Saskatoon||ca\n2|Mississauga||ca\n2|Kitchener||ca\n2|Gatineau||ca\n2|Sherbrooke||ca\n2|Trois-Rivières||ca\n2|Moncton||ca\n2|Fredericton||ca\n2|Charlottetown||ca\n2|St. John's/Saint John's||ca\n1|Whitehorse||ca\n1|Yellowknife||ca\n1|Iqaluit||ca\n1|Thunder Bay||ca\n1|Kelowna||ca\n1|Banff||ca\n1|Niagara Falls||ca\n1|Windsor||ca\n1|Kingston||ca\n1|Sudbury||ca\n1|Saguenay||ca\n1|Lévis||ca\n1|Burnaby||ca\n1|Surrey||ca\n1|Brampton||ca\n1|Markham||ca\n1|Oshawa||ca\n1|Barrie||ca\n1|Saint John||ca\n0|Sydney||no\n0|Dubai|Dubaï|no\n0|Moscow|Moscou|no\n0|Beijing|Pékin|no\n0|Amsterdam||no\n0|Brussels|Bruxelles|no\n0|Geneva|Genève|no\n0|Monaco||no\n0|Lisbon|Lisbonne|no\n0|Vienna|Vienne|no"},"rivers":{"z":1,"d":["river","fleuve","riviere"],"e":"9|Nile|Nil|af\n9|Amazon|Amazone|sa\n8|Mississippi||na\n7|Thames|Tamise|eu\n7|Seine||eu fr\n6|Danube||eu\n6|Rhine|Rhin|eu fr\n6|Yangtze/Yangtze River/Chang Jiang|Yangzi Jiang/Yangtsé/Yang-Tsé-Kiang|as\n6|Ganges/Ganga|Gange|as\n5|Loire||eu fr\n5|Rhône/Rhone||eu fr\n5|Volga||eu\n5|Mekong|Mékong|as\n5|Colorado||na\n5|Missouri||na\n4|Hudson||na\n4|Tiber|Tibre|eu\n4|Congo||af\n4|Niger||af\n4|Zambezi|Zambèze|af\n4|Jordan|Jourdain|as\n4|Euphrates|Euphrate|as\n4|Tigris|Tigre|as\n4|Yellow River/Huang He|Fleuve Jaune/Huang He|as\n4|Indus||as\n4|Garonne||eu fr\n4|Rio Grande/Rio Bravo||na\n4|St. Lawrence/Saint Lawrence|Saint-Laurent|na\n3|Ohio||na\n3|Yukon||na\n3|Columbia||na\n3|Mackenzie||na\n3|Elbe||eu\n3|Oder|Oder/Odra|eu\n3|Vistula|Vistule|eu\n3|Po|Pô|eu\n3|Ebro|Èbre|eu\n3|Tagus|Tage|eu\n3|Douro|Douro/Duero|eu\n3|Guadalquivir||eu\n3|Dnieper|Dniepr|eu\n3|Don||eu\n3|Ural||eu as\n3|Ob||as\n3|Yenisei|Ienisseï|as\n3|Lena||as\n3|Amur|Amour|as\n3|Brahmaputra|Brahmapoutre|as\n3|Irrawaddy||as\n3|Orinoco|Orénoque|sa\n3|Paraná||sa\n3|Paraguay||sa\n3|Uruguay||sa\n3|Murray||oc\n3|Darling||oc\n3|Orange||af\n3|Limpopo||af\n3|Senegal|Sénégal|af\n3|Dordogne||eu fr\n3|Moselle||eu fr\n3|Meuse||eu fr\n3|Marne||eu fr\n3|Somme||eu fr\n3|Lot||eu fr\n3|Tarn||eu fr\n2|Durance||eu fr\n2|Isère||eu fr\n2|Saône||eu fr\n2|Allier||eu fr\n2|Cher||eu fr\n2|Vienne||eu fr\n2|Charente||eu fr\n2|Oise||eu fr\n2|Aisne||eu fr\n2|Yonne||eu fr\n2|Adour||eu fr\n2|Vilaine||eu fr\n2|Var||eu fr\n2|Aude||eu fr\n2|Hérault||eu fr\n2|Indre||eu fr\n2|Orne||eu fr\n2|Escaut/Scheldt|Escaut|eu fr\n2|Doubs||eu fr\n1|Ariège||eu fr\n1|Gard||eu fr\n1|Ain||eu fr\n1|Eure||eu fr\n1|Mayenne||eu fr\n1|Sarthe||eu fr\n1|Creuse||eu fr\n1|Vézère||eu fr\n1|Ardèche||eu fr\n1|Verdon||eu fr\n1|Aveyron||eu fr\n1|Lys||eu fr\n1|Sambre||eu fr\n1|Ill||eu fr\n2|Severn||eu\n2|Trent||eu\n2|Mersey||eu\n2|Tyne||eu\n2|Avon||eu\n2|Clyde||eu\n2|Shannon||eu\n2|Liffey||eu\n2|Arno||eu\n2|Adige||eu\n2|Main||eu\n2|Neckar||eu\n2|Weser||eu\n2|Inn||eu\n2|Dniester|Dniestr|eu\n2|Neva|Neva/Néva|eu\n2|Daugava/Western Dvina||eu\n2|Kama||eu\n2|Pechora|Petchora|eu\n2|Thjórsá||eu\n2|Glomma||eu\n2|Kemijoki||eu\n1|Tisza|Tisza/Tisa|eu\n1|Drava|Drave|eu\n1|Sava|Save|eu\n1|Morava||eu\n1|Vltava/Moldau|Vltava|eu\n1|Maritsa/Evros|Maritsa|eu\n1|Guadiana||eu\n1|Miño/Minho|Minho|eu\n1|Mondego||eu\n1|Ticino/Tessin|Tessin|eu\n1|Aare|Aar|eu\n1|Piave||eu\n1|Rubicon||eu\n2|Okavango||af\n2|Kasai||af\n2|Ubangi|Oubangui|af\n2|Blue Nile|Nil Bleu|af\n2|White Nile|Nil Blanc|af\n2|Volta||af\n2|Gambia|Gambie|af\n1|Juba||af\n1|Rufiji||af\n1|Cuanza/Kwanza||af\n2|Salween||as\n2|Chao Phraya||as\n2|Pearl River/Zhujiang|Rivière des Perles|as\n2|Syr Darya|Syr-Daria|as\n2|Amu Darya|Amou-Daria|as\n2|Yamuna||as\n2|Godavari||as\n2|Krishna||as\n1|Kolyma||as\n1|Irtysh|Irtych|as\n1|Han||as\n1|Red River|Fleuve Rouge|as\n2|Arkansas||na\n2|Tennessee||na\n2|Snake||na\n2|Potomac||na\n2|Delaware||na\n2|Hudson Bay||no\n2|Niagara||na\n2|Fraser||na\n2|Nelson||na\n2|Madeira||sa\n2|São Francisco||sa\n2|Magdalena||sa\n2|Rio Negro/Negro||sa\n1|Xingu||sa\n1|Tocantins||sa\n1|Araguaia||sa\n1|Putumayo||sa\n1|Ucayali||sa\n1|Marañón||sa\n1|Murrumbidgee||oc\n1|Waikato||oc\n1|Clutha||oc\n1|Fly||oc\n1|Sepik||oc\n1|Swan||oc\n0|Atlantic|Atlantique|no\n0|Pacific|Pacifique|no\n0|Mediterranean|Méditerranée|no"},"seas":{"z":1,"d":["sea","ocean","mer","oceans","seas","mers","of","du","de","des","d"],"e":"9|Pacific Ocean/Pacific|Océan Pacifique/Pacifique|ocean\n9|Atlantic Ocean/Atlantic|Océan Atlantique/Atlantique|ocean\n7|Indian Ocean|Océan Indien|ocean\n6|Arctic Ocean|Océan Arctique|ocean\n5|Southern Ocean/Antarctic Ocean|Océan Austral/Océan Antarctique|ocean\n8|Mediterranean Sea/Mediterranean|Mer Méditerranée/Méditerranée|sea\n6|Red Sea|Mer Rouge|sea\n6|Dead Sea|Mer Morte|sea\n6|Black Sea|Mer Noire|sea\n6|Caribbean Sea/Caribbean|Mer des Caraïbes/Mer des Antilles|sea\n5|North Sea|Mer du Nord|sea\n5|Baltic Sea|Mer Baltique|sea\n5|Caspian Sea|Mer Caspienne|sea\n4|Adriatic Sea|Mer Adriatique|sea\n4|Aegean Sea|Mer Égée|sea\n3|Ionian Sea|Mer Ionienne|sea\n3|Tyrrhenian Sea|Mer Tyrrhénienne|sea\n3|Ligurian Sea|Mer Ligure|sea\n3|Irish Sea|Mer d'Irlande|sea\n4|English Channel/Channel|Manche|sea\n3|Celtic Sea|Mer Celtique|sea\n3|Norwegian Sea|Mer de Norvège|sea\n3|Barents Sea|Mer de Barents|sea\n3|White Sea|Mer Blanche|sea\n3|Sea of Azov|Mer d'Azov|sea\n3|Sea of Marmara|Mer de Marmara|sea\n3|Arabian Sea|Mer d'Oman/Mer d'Arabie|sea\n3|South China Sea|Mer de Chine méridionale|sea\n3|East China Sea|Mer de Chine orientale|sea\n3|Yellow Sea|Mer Jaune|sea\n3|Sea of Japan/East Sea|Mer du Japon|sea\n3|Coral Sea|Mer de Corail|sea\n3|Tasman Sea|Mer de Tasman|sea\n3|Bering Sea|Mer de Béring|sea\n3|Sargasso Sea|Mer des Sargasses|sea\n3|Aral Sea|Mer d'Aral|sea\n2|Sea of Okhotsk|Mer d'Okhotsk|sea\n2|Philippine Sea|Mer des Philippines|sea\n2|Java Sea|Mer de Java|sea\n2|Banda Sea|Mer de Banda|sea\n2|Celebes Sea|Mer de Célèbes|sea\n2|Sulu Sea|Mer de Sulu|sea\n2|Andaman Sea|Mer d'Andaman|sea\n2|Timor Sea|Mer de Timor|sea\n2|Arafura Sea|Mer d'Arafura|sea\n2|Solomon Sea|Mer des Salomon|sea\n2|Weddell Sea|Mer de Weddell|sea\n2|Ross Sea|Mer de Ross|sea\n2|Labrador Sea|Mer du Labrador|sea\n2|Greenland Sea|Mer du Groenland|sea\n2|Kara Sea|Mer de Kara|sea\n2|Laptev Sea|Mer de Laptev|sea\n2|Beaufort Sea|Mer de Beaufort|sea\n2|Chukchi Sea|Mer des Tchouktches|sea\n2|East Siberian Sea|Mer de Sibérie orientale|sea\n2|Balearic Sea|Mer des Baléares|sea\n2|Alboran Sea|Mer d'Alboran|sea\n1|Wadden Sea|Mer des Wadden|sea\n1|Bismarck Sea|Mer de Bismarck|sea\n1|Scotia Sea|Mer de Scotia|sea\n1|Amundsen Sea|Mer d'Amundsen|sea\n1|Sea of Galilee|Mer de Galilée/Lac de Tibériade|sea\n1|Salton Sea||sea\n1|Seto Inland Sea|Mer intérieure de Seto|sea\n1|Bellingshausen Sea|Mer de Bellingshausen|sea\n1|Libyan Sea|Mer de Libye|sea\n1|Sea of Crete|Mer de Crète|sea\n1|Iroise Sea|Mer d'Iroise|sea\n1|Bothnian Sea|Mer de Botnie|sea\n1|Molucca Sea|Mer des Moluques|sea\n1|Flores Sea|Mer de Flores|sea\n1|Savu Sea|Mer de Savu|sea\n1|Halmahera Sea|Mer d'Halmahera|sea\n1|Lincoln Sea|Mer de Lincoln|sea\n1|Pechora Sea|Mer de Petchora|sea\n0|Gulf of Mexico|Golfe du Mexique|no\n0|Persian Gulf|Golfe Persique|no\n0|Bay of Biscay|Golfe de Gascogne|no\n0|Bay of Bengal|Golfe du Bengale|no\n0|Hudson Bay|Baie d'Hudson|no\n0|Lake Victoria|Lac Victoria|no\n0|Great Lakes|Grands Lacs|no\n0|Nile|Nil|no\n0|Amazon|Amazone|no"},"islands":{"z":1,"d":["island","islands","isle","isles","ile","iles","isla","islas","of","du","de","des","d"],"e":"8|Madagascar||\n8|Greenland|Groenland|\n8|Iceland|Islande|\n7|Sicily|Sicile|\n7|Corsica|Corse|\n7|Hawaii/Big Island|Hawaï|\n7|Bali||\n7|Jamaica|Jamaïque|\n7|Cuba||\n6|Ireland|Irlande|\n6|Great Britain|Grande-Bretagne|\n6|Sardinia|Sardaigne|\n6|Crete|Crète|\n6|Cyprus|Chypre|\n6|Malta|Malte|\n6|Tahiti||\n6|Mallorca/Majorca|Majorque|\n6|Ibiza||\n6|Sri Lanka/Ceylon|Sri Lanka/Ceylan|\n6|Tasmania|Tasmanie|\n5|Borneo|Bornéo|\n5|Sumatra||\n5|Java||\n5|New Guinea|Nouvelle-Guinée|\n5|Honshu||\n5|Taiwan/Formosa|Taïwan/Formose|\n5|Singapore|Singapour|\n5|Santorini/Thira|Santorin|\n5|Mykonos||\n5|Capri||\n5|Zanzibar||\n5|Mauritius|Île Maurice/Maurice|\n5|Réunion/Reunion|La Réunion|\n5|Martinique||\n5|Guadeloupe||\n5|Easter Island/Rapa Nui|Île de Pâques/Rapa Nui|\n5|Galápagos/Galapagos Islands/Galapagos|Galápagos/Îles Galápagos|\n5|Canary Islands/Canaries|Îles Canaries/Canaries|\n5|Tenerife||\n5|Gran Canaria||\n5|Isle of Man|Île de Man|\n5|Jersey||\n5|Guernsey|Guernesey|\n5|Puerto Rico|Porto Rico|\n5|Bahamas||\n5|Barbados|Barbade|\n5|Phuket||\n5|Maldives||\n5|Seychelles||\n4|Fiji|Fidji|\n2|Samoa||\n4|Bora Bora||\n3|New Caledonia|Nouvelle-Calédonie|\n3|Mayotte||\n3|Newfoundland|Terre-Neuve|\n2|Vancouver Island|Île de Vancouver|\n2|Baffin Island|Terre de Baffin|\n2|Ellesmere Island|Île d'Ellesmere|\n2|Victoria Island|Île Victoria|\n3|Long Island||\n4|Manhattan||\n3|Alcatraz||\n3|Rhodes||\n3|Corfu|Corfou|\n2|Lesbos||\n3|Elba|Île d'Elbe/Elbe|\n3|Menorca/Minorca|Minorque|\n3|Lanzarote||\n2|Fuerteventura||\n3|Madeira|Madère|\n3|Azores|Açores|\n3|Faroe Islands/Faroes|Îles Féroé/Féroé|\n3|Svalbard/Spitsbergen||\n2|Gotland||\n2|Zealand/Sjælland|Seeland|\n3|Skye/Isle of Skye|Skye|\n2|Anglesey||\n3|Isle of Wight|Île de Wight|\n2|Orkney/Orkney Islands|Orcades|\n2|Shetland/Shetland Islands|Shetland|\n2|Hebrides|Hébrides|\n3|Belle-Île/Belle Île||\n3|Île de Ré/Ile de Re/Ré|Île de Ré/Ré|\n3|Oléron|Île d'Oléron/Oléron|\n2|Noirmoutier||\n2|Ouessant/Ushant|Ouessant|\n2|Porquerolles||\n2|Mont-Saint-Michel||\n3|Saint-Martin/Saint Martin/Sint Maarten||\n3|Saint Barthélemy/St Barts/Saint-Barth|Saint-Barthélemy/Saint-Barth|\n3|Saint Helena|Sainte-Hélène|\n2|Saint Lucia|Sainte-Lucie|\n2|Trinidad|Trinité|\n2|Tobago||\n3|Aruba||\n2|Curaçao/Curacao||\n3|Bermuda|Bermudes|\n2|Cayman Islands|Îles Caïmans|\n3|Falkland Islands/Falklands|Îles Malouines/Malouines|\n2|Tierra del Fuego|Terre de Feu|\n3|Hokkaido||\n2|Kyushu||\n2|Shikoku||\n3|Okinawa||\n2|Hainan||\n2|Hong Kong Island||\n2|Luzon||\n2|Mindanao||\n2|Sulawesi/Celebes|Célèbes/Sulawesi|\n2|Lombok||\n2|Komodo||\n2|Timor||\n2|Sakhalin|Sakhaline|\n2|Kodiak||\n2|Nantucket||\n1|Martha's Vineyard||\n2|Prince Edward Island|Île-du-Prince-Édouard|\n1|Cape Breton Island|Île du Cap-Breton|\n1|Anticosti||\n1|Iona||\n1|Lewis/Lewis and Harris|Lewis et Harris|\n1|Mull||\n1|Islay||\n1|Arran||\n1|Achill||\n2|Ischia||\n2|Lampedusa||\n1|Stromboli||\n2|Naxos||\n1|Paros||\n2|Kos||\n2|Zakynthos/Zante|Zante|\n1|Kefalonia/Cephalonia|Céphalonie|\n2|Ithaca|Ithaque|\n1|Hvar||\n1|Krk||\n1|Bornholm||\n1|Öland||\n1|Saaremaa||\n1|Heligoland||\n1|Sylt||\n1|Rügen||\n1|Texel||\n1|Socotra||\n1|Pemba||\n1|Bioko||\n1|Cape Verde/Cabo Verde|Cap-Vert|\n1|Comoros|Comores|\n1|Andaman Islands|Îles Andaman|\n2|Phi Phi/Koh Phi Phi||\n2|Koh Samui/Ko Samui||\n1|Langkawi||\n1|Penang||\n1|Palawan||\n1|Cebu||\n1|Boracay||\n2|Jeju||\n2|Guam||\n1|Saipan||\n1|Tonga||\n1|Vanuatu||\n1|Nauru||\n1|Kiribati||\n2|Marquesas|Îles Marquises/Marquises|\n2|Moorea||\n1|Wallis||\n1|Futuna||\n1|Pitcairn||\n1|Norfolk Island|Île Norfolk|\n1|Lord Howe Island|Île Lord Howe|\n1|Fraser Island/K'gari||\n1|Kangaroo Island|Île Kangourou|\n2|North Island|Île du Nord|\n2|South Island|Île du Sud|\n1|Stewart Island||\n1|Chatham Islands|Îles Chatham|\n1|Bougainville||\n1|Guadalcanal||\n1|Tristan da Cunha||\n1|Ascension Island|Île de l'Ascension|\n1|South Georgia|Géorgie du Sud|\n2|Kerguelen|Îles Kerguelen|\n1|Saint-Pierre/Saint-Pierre-et-Miquelon|Saint-Pierre-et-Miquelon|\n1|Clipperton||\n1|Wrangel Island|Île Wrangel|\n1|Novaya Zemlya|Nouvelle-Zemble|\n1|Franz Josef Land|Terre François-Joseph|\n1|Jan Mayen||\n1|Lofoten/Lofoten Islands|Îles Lofoten|\n2|Ellis Island||\n2|Staten Island||\n2|Key West||\n1|Aldabra||\n0|Australia|Australie|no\n0|Antarctica|Antarctique|no\n0|Atlantis|Atlantide|no"},"mountains":{"z":1,"d":["mount","mountain","mountains","mont","monts","montagne","montagnes","massif","of","du","de","des","d","la"],"e":"9|Everest/Mount Everest/Qomolangma|Everest/Mont Everest|peak\n8|Mont Blanc/Mount Blanc||peak\n8|Alps|Alpes|range\n8|Himalayas/Himalaya|Himalaya|range\n7|Kilimanjaro/Mount Kilimanjaro||peak\n7|Andes|Andes/Cordillère des Andes|range\n7|Rocky Mountains/Rockies|Montagnes Rocheuses/Rocheuses|range\n7|Mount Fuji/Fuji/Fujiyama|Mont Fuji/Fuji|peak\n7|Pyrenees|Pyrénées|range\n6|K2||peak\n6|Matterhorn/Cervino|Cervin|peak\n6|Vesuvius|Vésuve|peak\n6|Etna/Mount Etna||peak\n6|Olympus/Mount Olympus|Olympe/Mont Olympe|peak\n6|Urals/Ural Mountains|Oural/Monts Oural|range\n6|Appalachians/Appalachian Mountains|Appalaches|range\n5|Kangchenjunga||peak\n5|Denali/Mount McKinley||peak\n5|Aconcagua||peak\n5|Elbrus/Mount Elbrus||peak\n5|Mont Ventoux/Ventoux||peak\n5|Vosges||range\n5|Jura||range\n5|Massif Central|Massif central|range\n5|Carpathians/Carpathian Mountains|Carpates|range\n5|Atlas Mountains/Atlas|Atlas|range\n5|Caucasus|Caucase|range\n5|Apennines|Apennins|range\n5|Dolomites||range\n5|Mount Sinai/Sinai|Mont Sinaï/Sinaï|peak\n5|Table Mountain|Montagne de la Table|peak\n5|Mount Rushmore||peak\n5|Puy de Dôme||peak\n5|Mont Saint-Michel||no\n3|Lhotse||peak\n2|Makalu||peak\n2|Cho Oyu||peak\n3|Annapurna||peak\n2|Nanga Parbat||peak\n2|Dhaulagiri||peak\n2|Manaslu||peak\n2|Shishapangma||peak\n2|Gasherbrum||peak\n2|Broad Peak||peak\n3|Mount Kenya|Mont Kenya|peak\n3|Mount Cook/Aoraki|Mont Cook/Aoraki|peak\n3|Mount Kosciuszko/Kosciuszko||peak\n3|Mount Rainier/Rainier||peak\n3|Mount St. Helens/Saint Helens|Mont Saint Helens|peak\n2|Mount Whitney/Whitney||peak\n2|Mount Logan/Logan||peak\n3|Popocatépetl||peak\n2|Chimborazo||peak\n2|Cotopaxi||peak\n2|Huascarán||peak\n2|Ojos del Salado||peak\n3|Mount Ararat/Ararat|Mont Ararat/Ararat|peak\n2|Mount Elgon/Elgon||peak\n2|Rwenzori||range\n2|Mont Aiguille||peak\n3|Aiguille du Midi||peak\n3|Eiger||peak\n3|Jungfrau||peak\n2|Monte Rosa|Mont Rose|peak\n2|Grossglockner||peak\n3|Zugspitze||peak\n3|Ben Nevis||peak\n3|Snowdon/Yr Wyddfa||peak\n2|Scafell Pike||peak\n3|Mount Teide/Teide|Teide|peak\n2|Pico de Orizaba/Citlaltépetl||peak\n3|Mauna Kea||peak\n2|Mauna Loa||peak\n2|Kilauea||peak\n2|Mount Vinson/Vinson Massif|Mont Vinson|peak\n2|Mount Erebus|Mont Erebus|peak\n3|Stromboli||peak\n2|Mount Pelée/Pelée|Montagne Pelée|peak\n2|Piton des Neiges||peak\n2|Piton de la Fournaise||peak\n2|Mount Kinabalu/Kinabalu||peak\n2|Mount Hood||peak\n2|Mount Shasta||peak\n2|Pikes Peak||peak\n2|Mont Aigoual/Aigoual||peak\n2|Canigou/Pic du Canigou|Canigou|peak\n2|Mont Cinto/Cinto||peak\n2|Vignemale||peak\n2|Aneto||peak\n2|Mulhacén||peak\n2|Triglav||peak\n2|Musala||peak\n2|Mount Athos/Athos|Mont Athos|peak\n2|Mount Pilatus/Pilatus||peak\n2|Mount Hermon|Mont Hermon|peak\n2|Kailash/Mount Kailash||peak\n3|Krakatoa||peak\n2|Mount Tambora/Tambora||peak\n2|Mount Pinatubo/Pinatubo||peak\n2|Mount Merapi/Merapi||peak\n3|Eyjafjallajökull||peak\n2|Hekla||peak\n3|Sierra Nevada||range\n2|Cascades/Cascade Range|Chaîne des Cascades|range\n2|Sierra Madre||range\n2|Tian Shan|Tian Shan/Tianshan|range\n2|Hindu Kush||range\n2|Karakoram||range\n2|Pamir/Pamirs|Pamir|range\n2|Altai|Altaï|range\n2|Zagros||range\n2|Taurus Mountains|Taurus|range\n2|Balkan Mountains|Grand Balkan|range\n3|Black Forest|Forêt-Noire|range\n2|Harz||range\n2|Scandinavian Mountains|Alpes scandinaves|range\n2|Great Dividing Range|Cordillère australienne|range\n2|Drakensberg||range\n2|Ethiopian Highlands|Hauts plateaux d'Éthiopie|range\n2|Ahaggar/Hoggar|Hoggar|range\n2|Tibesti||range\n2|Brooks Range|Chaîne Brooks|range\n2|Alaska Range|Chaîne d'Alaska|range\n2|Adirondacks||range\n2|Ozarks||range\n2|Blue Ridge Mountains|Blue Ridge|range\n2|Smoky Mountains/Great Smoky Mountains||range\n2|Chartreuse||range\n2|Mercantour||range\n2|Écrins/Ecrins|Écrins|range\n2|Vercors||range\n2|Morvan||range\n3|Cévennes/Cevennes||range\n2|Sierra Morena||range\n2|Picos de Europa||range\n2|Tatra Mountains/Tatras|Tatras|range\n2|Sudetes|Sudètes|range\n2|Pennines||range\n2|Grampians|Monts Grampians|range\n0|Grand Canyon||no\n0|Niagara Falls|Chutes du Niagara|no"},"deserts":{"z":1,"d":["desert","deserts","desierto","of","du","de","des","d"],"e":"9|Sahara||hot\n7|Gobi||cold\n6|Kalahari||hot\n6|Atacama||hot\n6|Antarctic Desert/Antarctica|Désert antarctique/Antarctique|cold\n5|Arabian Desert|Désert d'Arabie|hot\n5|Mojave/Mojave Desert|Mojave|hot\n5|Namib||hot\n5|Sonoran|Sonora|hot\n4|Death Valley|Vallée de la Mort|hot\n4|Great Victoria Desert|Grand désert de Victoria|hot\n4|Thar||hot\n4|Taklamakan/Taklimakan||cold\n4|Great Basin|Grand Bassin|cold\n4|Chihuahuan|Chihuahua|hot\n4|Arctic Desert/Arctic|Désert arctique/Arctique|cold\n3|Rub' al Khali/Empty Quarter|Rub al-Khali|hot\n1|Syrian Desert|Désert de Syrie|hot\n3|Negev|Néguev|hot\n3|Sinai|Sinaï|hot\n2|Libyan Desert|Désert libyque|hot\n2|Nubian Desert|Désert de Nubie|hot\n2|Danakil||hot\n2|Karakum|Karakoum|cold\n1|Kyzylkum|Kyzylkoum|cold\n1|Dasht-e Kavir||hot\n1|Dasht-e Lut/Lut|Dasht-e Lut|hot\n2|Great Sandy Desert|Grand désert de sable|hot\n1|Gibson Desert|Désert de Gibson|hot\n2|Simpson Desert|Désert de Simpson|hot\n1|Tanami||hot\n2|Patagonian Desert/Patagonia|Désert de Patagonie|cold\n2|Painted Desert|Désert peint|hot\n1|Colorado Desert|Désert du Colorado|hot\n1|Black Rock Desert||cold\n2|Wadi Rum||hot\n2|Ténéré/Tenere||hot\n1|Ogaden||hot\n1|Chalbi||hot\n2|Judaean Desert/Judean Desert|Désert de Judée|hot\n1|Sechura||hot\n1|Monte Desert|Monte|hot\n1|Tabernas/Tabernas Desert|Désert de Tabernas|hot\n1|Bardenas Reales||hot\n1|Accona||hot\n1|Deliblato Sands|Sables de Deliblato|cold\n1|Ordos||cold\n1|Badain Jaran||cold\n1|Tengger||cold\n1|Cholistan||hot\n1|Lençóis Maranhenses||hot\n1|Strzelecki||hot\n1|Little Sandy Desert|Petit désert de sable|hot\n1|Great Salt Lake Desert||cold\n1|Owyhee||cold\n1|Red Desert|Désert rouge|cold\n0|Grand Canyon||no\n0|Sahel||no\n0|Savanna|Savane|no"},"lakes":{"z":1,"d":["lake","lakes","lac","lacs","loch","lago","of","du","de","des","d"],"e":"6|Lake Victoria/Victoria|Lac Victoria/Victoria|af\n6|Lake Geneva/Lac Léman/Leman|Lac Léman/Léman/Lac de Genève|eu fr\n6|Lake Superior/Superior|Lac Supérieur/Supérieur|na\n6|Loch Ness/Ness||eu\n6|Lake Baikal/Baikal|Lac Baïkal/Baïkal|as\n6|Lake Titicaca/Titicaca|Lac Titicaca/Titicaca|sa\n5|Lake Michigan/Michigan|Lac Michigan|na\n5|Lake Huron/Huron|Lac Huron|na\n5|Lake Erie/Erie|Lac Érié/Érié|na\n5|Lake Ontario/Ontario|Lac Ontario|na\n5|Lake Tanganyika/Tanganyika|Lac Tanganyika|af\n5|Lake Malawi/Lake Nyasa/Malawi|Lac Malawi/Lac Nyassa|af\n5|Lake Como/Como|Lac de Côme/Côme|eu\n5|Lake Garda/Garda|Lac de Garde/Garde|eu\n5|Lake Constance/Bodensee|Lac de Constance/Constance|eu\n5|Lake Annecy/Annecy|Lac d'Annecy/Annecy|eu fr\n5|Lake Tahoe/Tahoe|Lac Tahoe|na\n5|Great Salt Lake|Grand Lac Salé|na\n5|Lake Chad/Chad|Lac Tchad/Tchad|af\n3|Lake Ladoga/Ladoga|Lac Ladoga|eu\n2|Lake Onega/Onega|Lac Onega|eu\n3|Lake Balaton/Balaton|Lac Balaton|eu\n3|Lake Maggiore/Maggiore|Lac Majeur/Majeur|eu\n3|Lake Lucerne/Lucerne|Lac des Quatre-Cantons/Lucerne|eu\n3|Lake Zurich/Zurich|Lac de Zurich|eu\n2|Lake Neuchâtel/Neuchatel|Lac de Neuchâtel|eu\n3|Lake Bourget/Bourget|Lac du Bourget/Bourget|eu fr\n2|Lake Serre-Ponçon/Serre-Ponçon|Lac de Serre-Ponçon|eu fr\n3|Lake Bled/Bled|Lac de Bled|eu\n2|Lake Ohrid/Ohrid|Lac d'Ohrid|eu\n2|Lough Neagh/Neagh||eu\n3|Windermere/Lake Windermere||eu\n3|Loch Lomond/Lomond||eu\n2|Lake Vänern/Vänern|Lac Vänern|eu\n2|Lake Vättern/Vättern|Lac Vättern|eu\n2|Lake Saimaa/Saimaa|Lac Saimaa|eu\n2|Lake Peipus/Peipus|Lac Peïpous|eu\n2|Lake Prespa/Prespa|Lac Prespa|eu\n2|Lake Hallstatt/Hallstätter See||eu\n2|Lake Starnberg/Starnberg||eu\n3|Lake Winnipeg/Winnipeg|Lac Winnipeg|na\n2|Great Bear Lake|Grand lac de l'Ours|na\n2|Great Slave Lake|Grand lac des Esclaves|na\n3|Lake Louise/Louise|Lac Louise|na\n2|Lake Champlain/Champlain|Lac Champlain|na\n2|Lake Okeechobee/Okeechobee|Lac Okeechobee|na\n3|Lake Mead/Mead|Lac Mead|na\n2|Lake Powell/Powell|Lac Powell|na\n3|Crater Lake||na\n2|Lake Nicaragua/Nicaragua|Lac Nicaragua|na\n2|Lake Atitlán/Atitlan|Lac Atitlán|na\n2|Lake Maracaibo/Maracaibo|Lac Maracaibo|sa\n3|Lake Turkana/Turkana|Lac Turkana|af\n2|Lake Volta/Volta|Lac Volta|af\n2|Lake Kariba/Kariba|Lac Kariba|af\n3|Lake Nasser/Nasser|Lac Nasser|af\n2|Lake Tana/Tana|Lac Tana|af\n2|Lake Kivu/Kivu|Lac Kivu|af\n2|Lake Albert/Albert|Lac Albert|af\n3|Lake Retba/Lac Rose|Lac Rose/Lac Retba|af\n2|Lake Balkhash/Balkhash|Lac Balkhach|as\n2|Lake Issyk-Kul/Issyk-Kul|Lac Issyk-Koul|as\n2|Lake Van/Van|Lac de Van|as\n2|Lake Urmia/Urmia|Lac d'Ourmia|as\n2|Lake Toba/Toba|Lac Toba|as\n2|Lake Biwa/Biwa|Lac Biwa|as\n2|Qinghai Lake/Qinghai|Lac Qinghai|as\n2|Tonlé Sap||as\n2|Dal Lake|Lac Dal|as\n3|Lake Eyre/Kati Thanda|Lac Eyre|oc\n3|Lake Taupō/Taupo|Lac Taupo|oc\n2|Lake Tekapo/Tekapo|Lac Tekapo|oc\n2|Lake Wakatipu/Wakatipu|Lac Wakatipu|oc\n0|Caspian Sea|Mer Caspienne|no\n0|Dead Sea|Mer Morte|no\n0|Aral Sea|Mer d'Aral|no"},"animals":{"z":1,"d":[],"e":"9|Dog|Chien|mam\n9|Cat|Chat|mam\n9|Lion||mam af\n9|Elephant|Éléphant|mam af\n8|Tiger|Tigre|mam\n8|Giraffe|Girafe|mam af\n8|Monkey|Singe|mam\n8|Horse|Cheval/Chevaux|mam farm\n8|Cow|Vache|mam farm\n8|Bear|Ours|mam\n7|Pig|Cochon/Porc|mam farm\n7|Sheep|Mouton/Brebis|mam farm\n7|Zebra|Zèbre|mam af\n7|Wolf/Wolves|Loup|mam\n7|Fox/Foxes|Renard|mam\n7|Rabbit|Lapin|mam farm\n7|Kangaroo|Kangourou|mam aus\n7|Panda/Giant panda|Panda/Panda géant|mam\n7|Dolphin|Dauphin|mam sea\n7|Whale|Baleine|mam sea\n7|Gorilla|Gorille|mam af\n7|Hippopotamus/Hippo|Hippopotame|mam af\n7|Rhinoceros/Rhino|Rhinocéros|mam af\n7|Koala||mam aus\n6|Cheetah|Guépard|mam af\n6|Leopard|Léopard|mam af\n6|Goat|Chèvre/Bouc|mam farm\n6|Mouse/Mice|Souris|mam\n6|Rat||mam\n6|Squirrel|Écureuil|mam\n6|Deer|Cerf/Biche|mam\n6|Camel|Chameau|mam\n6|Chimpanzee/Chimp|Chimpanzé|mam af\n6|Polar bear|Ours polaire/Ours blanc|mam arc\n6|Bat|Chauve-souris|mam\n6|Hamster||mam\n6|Donkey|Âne|mam farm\n6|Hedgehog|Hérisson|mam\n6|Otter|Loutre|mam\n6|Seal|Phoque|mam sea arc\n6|Sloth|Paresseux|mam\n6|Jaguar||mam\n6|Bull|Taureau|mam farm\n6|Orangutan|Orang-outan|mam\n5|Lynx||mam\n5|Panther/Black panther|Panthère/Panthère noire|mam\n5|Puma/Cougar/Mountain lion|Puma/Couguar|mam\n5|Beaver|Castor|mam\n5|Raccoon|Raton laveur|mam\n5|Mole|Taupe|mam\n5|Badger|Blaireau|mam\n5|Weasel|Belette|mam\n5|Ferret|Furet|mam\n5|Guinea pig|Cochon d'Inde/Cobaye|mam\n5|Llama|Lama|mam farm\n5|Alpaca|Alpaga|mam farm\n5|Reindeer/Caribou|Renne/Caribou|mam arc\n5|Moose/Elk|Élan/Orignal|mam\n5|Buffalo|Buffle|mam af\n5|Bison||mam\n5|Yak|Yack/Yak|mam\n5|Ox/Oxen|Bœuf/Boeuf|mam farm\n5|Meerkat|Suricate|mam af\n5|Hyena|Hyène|mam af\n5|Walrus|Morse|mam sea arc\n5|Sea lion|Otarie/Lion de mer|mam sea\n5|Orca/Killer whale|Orque/Épaulard|mam sea\n5|Blue whale|Baleine bleue/Rorqual bleu|mam sea\n5|Humpback whale|Baleine à bosse/Mégaptère|mam sea\n5|Narwhal|Narval|mam sea arc\n5|Platypus|Ornithorynque|mam aus\n5|Wombat||mam aus\n5|Armadillo|Tatou|mam\n5|Anteater|Fourmilier|mam\n5|Porcupine|Porc-épic|mam\n5|Skunk|Mouffette/Moufette|mam\n5|Lemur|Lémurien/Maki|mam af\n5|Baboon|Babouin|mam af\n5|Antelope|Antilope|mam af\n5|Gazelle||mam af\n5|Warthog|Phacochère|mam af\n5|Wild boar/Boar|Sanglier|mam\n5|Jackal|Chacal|mam af\n5|Coyote||mam\n5|Hare|Lièvre|mam\n5|Chipmunk|Tamia|mam\n5|Gerbil|Gerbille|mam\n5|Shrew|Musaraigne|mam\n5|Dormouse|Loir|mam\n5|Marmot|Marmotte|mam\n5|Mongoose|Mangouste|mam af\n4|Okapi||mam af\n4|Tapir||mam\n4|Pangolin||mam af\n4|Aardvark|Oryctérope|mam af\n4|Wildebeest/Gnu|Gnou|mam af\n4|Impala||mam af\n4|Kudu|Koudou|mam af\n4|Eland|Éland|mam af\n4|Springbok||mam af\n4|Oryx||mam af\n4|Ibex|Bouquetin|mam\n4|Chamois||mam\n4|Mouflon||mam\n4|Musk ox|Bœuf musqué|mam arc\n4|Arctic fox|Renard polaire/Renard arctique|mam arc\n4|Fennec/Fennec fox|Fennec|mam af\n4|Red panda|Panda roux|mam\n4|Snow leopard|Panthère des neiges/Léopard des neiges|mam\n4|Ocelot||mam\n4|Serval||mam af\n4|Caracal||mam af\n4|Bobcat|Lynx roux|mam\n4|Wolverine|Glouton/Carcajou|mam arc\n4|Mink|Vison|mam\n4|Stoat/Ermine|Hermine|mam\n4|Marten/Pine marten|Martre|mam\n4|Polecat|Putois|mam\n4|Capybara|Capybara/Cabiai|mam\n4|Chinchilla||mam\n4|Opossum/Possum|Opossum|mam\n4|Tasmanian devil|Diable de Tasmanie|mam aus\n4|Wallaby||mam aus\n4|Quokka||mam aus\n4|Dingo||mam aus\n4|Echidna|Échidné|mam aus\n4|Sugar glider|Phalanger volant|mam aus\n3|Numbat||mam aus\n3|Bilby||mam aus\n3|Quoll||mam aus\n3|Bandicoot||mam aus\n4|Manatee|Lamantin|mam sea\n4|Dugong||mam sea aus\n4|Sperm whale|Cachalot|mam sea\n4|Beluga|Béluga|mam sea arc\n4|Porpoise|Marsouin|mam sea\n4|Elephant seal|Éléphant de mer|mam sea\n4|Sea otter|Loutre de mer|mam sea\n4|Gibbon||mam\n4|Mandrill||mam af\n4|Macaque||mam\n4|Capuchin/Capuchin monkey|Capucin|mam\n4|Howler monkey|Singe hurleur/Hurleur|mam\n4|Marmoset|Ouistiti|mam\n4|Tamarin||mam\n4|Bonobo||mam af\n3|Aye-aye||mam af\n3|Tarsier||mam\n3|Slow loris/Loris|Loris|mam\n3|Galago/Bushbaby|Galago|mam af\n3|Vicuña/Vicuna|Vigogne|mam\n3|Guanaco||mam\n4|Dromedary|Dromadaire|mam af\n3|Zebu|Zébu|mam farm\n3|Water buffalo|Buffle d'eau/Buffle d'Asie|mam farm\n3|Gaur||mam\n4|Fallow deer|Daim|mam\n4|Roe deer|Chevreuil|mam\n3|Red deer|Cerf élaphe|mam\n3|Wapiti/American elk|Wapiti|mam\n3|Muntjac||mam\n3|Pygmy hippopotamus/Pygmy hippo|Hippopotame pygmée|mam af\n4|Honey badger|Ratel|mam af\n3|Civet|Civette|mam\n3|Genet|Genette|mam af\n3|Binturong||mam\n3|Kinkajou||mam\n3|Coati||mam\n3|Pika||mam\n3|Lemming||mam arc\n3|Vole|Campagnol|mam\n3|Muskrat|Rat musqué|mam\n3|Prairie dog|Chien de prairie|mam\n3|Groundhog/Woodchuck|Marmotte d'Amérique|mam\n3|Flying squirrel|Écureuil volant|mam\n3|Jerboa|Gerboise|mam af\n3|Naked mole-rat|Rat-taupe nu|mam af\n3|Hyrax/Rock hyrax|Daman|mam af\n3|Elephant shrew|Musaraigne-éléphant|mam af\n3|Fossa||mam af\n3|Dhole||mam\n3|African wild dog|Lycaon|mam af\n3|Maned wolf|Loup à crinière|mam\n3|Raccoon dog|Chien viverrin|mam\n3|Spectacled bear|Ours à lunettes|mam\n3|Sun bear|Ours malais|mam\n3|Sloth bear|Ours lippu|mam\n4|Grizzly/Grizzly bear|Grizzly|mam\n4|Brown bear|Ours brun|mam\n4|Black bear|Ours noir|mam\n4|Mule||mam farm\n4|Pony|Poney|mam farm\n4|Lamb|Agneau|mam farm\n3|Calf|Veau|mam farm\n3|Piglet|Porcelet|mam farm\n3|Foal|Poulain|mam farm\n3|Kitten|Chaton|mam\n3|Puppy|Chiot|mam\n2|Saiga|Saïga|mam\n2|Takin||mam\n2|Markhor||mam\n2|Gerenuk|Gérénuk|mam af\n2|Bongo||mam af\n2|Dik-dik||mam af\n2|Duiker|Céphalophe|mam af\n2|Topi||mam af\n2|Hartebeest|Bubale|mam af\n2|Nyala||mam af\n2|Sable antelope|Hippotrague noir|mam af\n2|Addax||mam af\n2|Babirusa|Babiroussa|mam\n2|Peccary|Pécari|mam\n2|Agouti||mam\n2|Paca||mam\n2|Mara||mam\n2|Viscacha|Viscache|mam\n2|Degu|Octodon/Dègue|mam\n2|Solenodon|Solénodonte|mam\n2|Tenrec||mam af\n2|Colugo/Flying lemur|Colugo|mam\n2|Proboscis monkey|Nasique|mam\n2|Gelada|Gélada|mam af\n2|Colobus|Colobe|mam af\n2|Siamang||mam\n2|Uakari|Ouakari|mam\n2|Spider monkey|Atèle/Singe-araignée|mam\n2|Squirrel monkey|Saïmiri|mam\n3|Red fox|Renard roux|mam\n3|Grey wolf/Gray wolf|Loup gris|mam\n3|Arctic hare|Lièvre arctique|mam arc\n3|Bengal tiger|Tigre du Bengale|mam\n3|Siberian tiger|Tigre de Sibérie|mam\n2|Clouded leopard|Panthère nébuleuse|mam\n2|Margay||mam\n2|Sand cat|Chat des sables|mam af\n2|Wildcat|Chat sauvage/Chat forestier|mam\n2|Pallas's cat/Manul|Manul|mam\n2|Leopard seal|Léopard de mer|mam sea\n2|Minke whale|Petit rorqual|mam sea\n2|Fin whale|Rorqual commun|mam sea\n2|Grey whale/Gray whale|Baleine grise|mam sea\n2|Right whale|Baleine franche|mam sea\n2|Bowhead whale|Baleine boréale|mam sea arc\n2|Pilot whale|Globicéphale|mam sea\n3|Bottlenose dolphin|Grand dauphin|mam sea\n2|Vaquita|Vaquita/Marsouin du Pacifique|mam sea\n8|Eagle|Aigle|bird\n8|Parrot|Perroquet|bird\n8|Penguin|Manchot/Pingouin|bird sea arc\n8|Owl|Hibou/Chouette|bird\n8|Chicken/Hen|Poule/Poulet|bird farm\n7|Duck|Canard|bird farm\n7|Pigeon||bird\n7|Flamingo|Flamant/Flamant rose|bird\n7|Peacock/Peafowl|Paon|bird\n7|Swan|Cygne|bird\n7|Ostrich|Autruche|bird af\n7|Robin|Rouge-gorge|bird\n7|Sparrow|Moineau|bird\n7|Hummingbird|Colibri/Oiseau-mouche|bird\n7|Toucan||bird\n6|Seagull/Gull|Mouette/Goéland|bird sea\n6|Goose/Geese|Oie|bird farm\n6|Turkey|Dinde/Dindon|bird farm\n6|Falcon|Faucon|bird\n6|Hawk||bird\n6|Woodpecker|Pic/Pivert|bird\n6|Stork|Cigogne|bird\n6|Pelican|Pélican|bird\n6|Vulture|Vautour|bird\n6|Blackbird|Merle|bird\n6|Canary|Canari|bird\n6|Raven|Grand corbeau/Corbeau|bird\n6|Crow|Corneille|bird\n6|Kiwi||bird\n6|Emu|Émeu|bird aus\n6|Swallow|Hirondelle|bird\n6|Heron|Héron|bird\n6|Puffin|Macareux|bird sea\n5|Magpie|Pie|bird\n5|Kingfisher|Martin-pêcheur|bird\n5|Budgerigar/Budgie/Parakeet|Perruche|bird aus\n5|Cockatoo|Cacatoès|bird aus\n5|Macaw|Ara|bird\n5|Albatross|Albatros|bird sea\n5|Condor||bird\n5|Crane|Grue|bird\n5|Pheasant|Faisan|bird\n5|Quail|Caille|bird\n5|Partridge|Perdrix|bird\n5|Dove|Colombe/Tourterelle|bird\n5|Starling|Étourneau|bird\n5|Finch|Pinson|bird\n4|Goldfinch|Chardonneret|bird\n5|Tit/Blue tit|Mésange|bird\n4|Wren|Troglodyte|bird\n5|Nightingale|Rossignol|bird\n4|Lark/Skylark|Alouette|bird\n5|Cuckoo|Coucou|bird\n4|Jay|Geai|bird\n4|Cardinal||bird\n4|Blue jay|Geai bleu|bird\n5|Bald eagle|Pygargue à tête blanche|bird\n4|Golden eagle|Aigle royal|bird\n4|Kestrel|Crécerelle/Faucon crécerelle|bird\n4|Buzzard|Buse|bird\n3|Kite|Milan|bird\n3|Osprey|Balbuzard|bird\n4|Barn owl|Effraie/Chouette effraie|bird\n4|Snowy owl|Harfang des neiges/Chouette harfang|bird arc\n3|Eagle owl|Grand-duc|bird\n4|Cormorant|Cormoran|bird sea\n3|Gannet|Fou de Bassan|bird sea\n4|Ibis||bird af\n3|Spoonbill|Spatule|bird\n3|Egret|Aigrette|bird\n2|Bittern|Butor|bird\n2|Coot|Foulque|bird\n2|Moorhen|Poule d'eau|bird\n3|Mallard|Colvert|bird\n2|Teal|Sarcelle|bird\n3|Lovebird|Inséparable|bird af\n3|Cockatiel|Calopsitte|bird aus\n4|Kookaburra||bird aus\n4|Cassowary|Casoar|bird aus\n3|Rhea|Nandou|bird\n5|Dodo||bird\n4|Roadrunner|Géocoucou|bird\n3|Secretary bird|Messager sagittaire/Serpentaire|bird af\n3|Hornbill|Calao|bird\n3|Bird of paradise|Oiseau de paradis|bird\n3|Lyrebird|Oiseau-lyre|bird aus\n2|Weaver/Weaverbird|Tisserin|bird af\n3|Tern|Sterne|bird sea\n2|Petrel|Pétrel|bird sea\n2|Shearwater||bird sea\n2|Frigatebird|Frégate|bird sea\n2|Booby|Fou|bird sea\n2|Skua|Labbe|bird sea\n2|Razorbill/Auk|Petit pingouin|bird sea arc\n2|Oystercatcher|Huîtrier|bird\n2|Sandpiper|Bécasseau|bird\n2|Plover|Pluvier|bird\n2|Lapwing|Vanneau|bird\n2|Curlew|Courlis|bird\n2|Snipe|Bécassine|bird\n2|Woodcock|Bécasse|bird\n2|Avocet|Avocette|bird\n2|Grebe|Grèbe|bird\n2|Loon/Diver|Plongeon|bird\n3|Hoopoe|Huppe/Huppe fasciée|bird\n2|Bee-eater|Guêpier|bird\n2|Roller|Rollier|bird\n3|Swift|Martinet|bird\n2|Nightjar|Engoulevent|bird\n2|Wagtail|Bergeronnette|bird\n2|Warbler|Fauvette|bird\n3|Thrush|Grive|bird\n2|Nuthatch|Sittelle|bird\n2|Treecreeper|Grimpereau|bird\n2|Bullfinch|Bouvreuil|bird\n2|Greenfinch|Verdier|bird\n2|Siskin|Tarin|bird\n2|Linnet|Linotte|bird\n2|Bunting|Bruant|bird\n2|Shrike|Pie-grièche|bird\n2|Oriole|Loriot|bird\n2|Waxwing|Jaseur|bird\n2|Dipper|Cincle|bird\n2|Mockingbird|Moqueur|bird\n2|Chickadee||bird\n2|Grouse|Tétras|bird\n2|Ptarmigan|Lagopède|bird arc\n2|Capercaillie|Grand tétras|bird\n3|Guinea fowl|Pintade|bird farm af\n4|Rooster/Cockerel|Coq|bird farm\n3|Chick|Poussin|bird farm\n2|Duckling|Caneton|bird farm\n3|Harpy eagle|Harpie féroce|bird\n3|Peregrine falcon|Faucon pèlerin|bird\n2|Merlin|Faucon émerillon|bird\n2|Sparrowhawk|Épervier|bird\n2|Goshawk|Autour|bird\n2|Harrier|Busard|bird\n2|Marabou|Marabout|bird af\n3|Shoebill|Bec-en-sabot|bird af\n2|Hamerkop|Ombrette|bird af\n2|Jacana||bird\n3|Quetzal||bird\n2|Oxpecker|Pique-bœuf|bird af\n2|Mynah/Myna|Mainate|bird\n2|Kakapo||bird\n2|Kea|Kéa|bird\n2|Moa||bird\n2|Great auk|Grand pingouin|bird sea\n2|Passenger pigeon|Pigeon migrateur|bird\n2|Turtle dove|Tourterelle des bois|bird\n8|Shark|Requin|fish sea\n7|Salmon|Saumon|fish\n7|Goldfish|Poisson rouge|fish\n7|Tuna|Thon|fish sea\n7|Clownfish|Poisson-clown|fish sea\n6|Trout|Truite|fish\n6|Cod|Cabillaud/Morue|fish sea\n6|Swordfish|Espadon|fish sea\n6|Great white shark/White shark|Grand requin blanc/Requin blanc|fish sea\n6|Piranha||fish\n6|Carp|Carpe|fish\n6|Sardine||fish sea\n6|Pufferfish/Blowfish/Puffer fish|Poisson-globe/Fugu|fish sea\n6|Eel|Anguille|fish\n6|Stingray/Ray|Raie|fish sea\n5|Hammerhead shark|Requin-marteau|fish sea\n5|Whale shark|Requin-baleine|fish sea\n4|Tiger shark|Requin-tigre|fish sea\n5|Mackerel|Maquereau|fish sea\n5|Herring|Hareng|fish sea\n5|Anchovy|Anchois|fish sea\n4|Sole||fish sea\n3|Plaice|Plie/Carrelet|fish sea\n3|Halibut|Flétan|fish sea\n3|Haddock|Églefin/Aiglefin|fish sea\n3|Hake|Merlu|fish sea\n4|Sea bass|Bar/Loup de mer|fish sea\n4|Sea bream|Daurade/Dorade|fish sea\n3|Monkfish|Lotte/Baudroie|fish sea\n4|Pike|Brochet|fish\n4|Perch|Perche|fish\n4|Catfish|Poisson-chat/Silure|fish\n5|Barracuda||fish sea\n4|Marlin||fish sea\n3|Sailfish|Voilier/Espadon voilier|fish sea\n6|Seahorse|Hippocampe|fish sea\n4|Angelfish|Poisson-ange|fish\n4|Manta ray|Raie manta|fish sea\n4|Electric eel|Anguille électrique|fish\n4|Moray eel/Moray|Murène|fish sea\n4|Flying fish|Poisson volant/Exocet|fish sea\n4|Anglerfish|Baudroie abyssale|fish sea\n4|Lionfish|Poisson-scorpion/Rascasse volante|fish sea\n4|Guppy||fish\n3|Betta/Siamese fighting fish|Combattant/Betta|fish\n3|Neon tetra/Tetra|Néon/Tétra|fish\n4|Koi|Carpe koï/Koï|fish\n3|Sturgeon|Esturgeon|fish\n3|Mullet|Mulet|fish sea\n3|Bass||fish\n3|Tilapia||fish\n2|Zander/Pikeperch|Sandre|fish\n2|Bream|Brème|fish\n2|Roach|Gardon|fish\n2|Tench|Tanche|fish\n2|Gudgeon|Goujon|fish\n2|Minnow|Vairon|fish\n2|Grayling|Ombre|fish\n2|Char/Arctic char|Omble/Omble chevalier|fish\n2|Pollock|Lieu/Colin|fish sea\n2|Whiting|Merlan|fish sea\n2|Turbot||fish sea\n2|John Dory|Saint-Pierre|fish sea\n2|Red mullet|Rouget|fish sea\n2|Scorpionfish|Rascasse|fish sea\n2|Gurnard|Grondin|fish sea\n2|Conger eel/Conger|Congre|fish sea\n2|Skate||fish sea\n2|Mahi-mahi/Dorado|Coryphène|fish sea\n3|Bluefin tuna|Thon rouge|fish sea\n3|Sunfish/Ocean sunfish/Mola|Poisson-lune|fish sea\n2|Wrasse|Labre|fish sea\n3|Parrotfish|Poisson-perroquet|fish sea\n2|Surgeonfish/Tang/Blue tang|Poisson-chirurgien|fish sea\n2|Butterflyfish|Poisson-papillon|fish sea\n2|Triggerfish|Baliste|fish sea\n3|Grouper|Mérou|fish sea\n2|Snapper|Vivaneau|fish sea\n2|Cichlid|Cichlidé|fish\n2|Discus||fish\n2|Molly||fish\n2|Platy||fish\n2|Swordtail|Xipho|fish\n2|Danio/Zebrafish|Danio/Poisson-zèbre|fish\n2|Loach|Loche|fish\n2|Pleco|Pléco|fish\n2|Arowana||fish\n2|Oscar||fish\n3|Coelacanth|Cœlacanthe|fish sea\n2|Lungfish|Dipneuste|fish\n2|Lamprey|Lamproie|fish\n2|Hagfish|Myxine|fish sea\n2|Remora|Rémora|fish sea\n2|Barramundi||fish aus\n2|Snakehead|Tête de serpent|fish\n2|Bull shark|Requin bouledogue|fish sea\n2|Mako shark|Requin mako|fish sea\n2|Basking shark|Requin pèlerin|fish sea\n2|Nurse shark|Requin-nourrice|fish sea\n2|Blue shark|Requin bleu|fish sea\n2|Goblin shark|Requin-lutin|fish sea\n2|Greenland shark|Requin du Groenland|fish sea arc\n2|Megalodon|Mégalodon|no\n2|Sawfish|Poisson-scie|fish sea\n3|Stonefish|Poisson-pierre|fish sea\n2|Archerfish|Poisson-archer|fish\n2|Mudskipper|Périophtalme|fish\n2|Pipefish|Syngnathe|fish sea\n2|Sea dragon/Leafy seadragon|Dragon de mer|fish sea\n2|Viperfish|Poisson-vipère|fish sea\n2|Lanternfish|Poisson-lanterne|fish sea\n2|Oarfish|Régalec|fish sea\n8|Snake|Serpent|rep\n8|Crocodile||rep\n7|Turtle|Tortue|rep sea\n7|Lizard|Lézard|rep\n7|Alligator||rep\n6|Chameleon|Caméléon|rep af\n6|Iguana|Iguane|rep\n6|Gecko||rep\n6|Cobra||rep\n6|Python||rep\n6|Komodo dragon|Dragon de Komodo/Varan de Komodo|rep\n5|Tortoise|Tortue terrestre|rep\n5|Rattlesnake|Serpent à sonnette/Crotale|rep\n5|Anaconda||rep\n5|Boa/Boa constrictor|Boa|rep\n5|Viper|Vipère|rep\n4|Sea turtle|Tortue marine|rep sea\n4|Monitor lizard|Varan|rep\n4|Black mamba|Mamba noir|rep af\n4|Mamba||rep af\n4|King cobra|Cobra royal|rep\n4|Caiman|Caïman|rep\n3|Gharial|Gavial|rep\n3|Leatherback turtle|Tortue luth|rep sea\n3|Grass snake|Couleuvre|rep\n3|Adder|Péliade|rep\n3|Slow worm|Orvet|rep\n3|Gila monster|Monstre de Gila|rep\n3|Bearded dragon|Pogona/Agame barbu|rep aus\n3|Frilled lizard|Lézard à collerette|rep aus\n3|Thorny devil|Diable cornu/Moloch|rep aus\n2|Basilisk|Basilic|rep\n2|Skink|Scinque|rep\n2|Anole|Anolis|rep\n2|Tuatara|Tuatara/Sphénodon|rep\n2|Horned lizard|Lézard cornu|rep\n2|Marine iguana|Iguane marin|rep sea\n3|Galápagos tortoise/Giant tortoise|Tortue des Galápagos/Tortue géante|rep\n2|Snapping turtle|Tortue serpentine|rep\n2|Box turtle|Tortue-boîte|rep\n2|Terrapin/Slider|Trachémyde/Tortue de Floride|rep\n2|Taipan|Taïpan|rep aus\n2|Coral snake|Serpent corail|rep\n2|Sea snake|Serpent de mer|rep sea\n2|Corn snake|Serpent des blés|rep\n2|Milk snake|Serpent-lait|rep\n2|Garter snake|Couleuvre rayée|rep\n2|Copperhead|Mocassin à tête cuivrée|rep\n2|Cottonmouth/Water moccasin|Mocassin d'eau|rep\n2|Asp|Aspic|rep\n2|Sidewinder|Crotale cornu|rep\n2|Puff adder|Vipère heurtante|rep af\n2|Boomslang||rep af\n2|Green mamba|Mamba vert|rep af\n2|Reticulated python|Python réticulé|rep\n2|Ball python/Royal python|Python royal|rep\n2|Saltwater crocodile|Crocodile marin|rep sea aus\n2|Nile crocodile|Crocodile du Nil|rep af\n8|Frog|Grenouille|amp\n7|Toad|Crapaud|amp\n6|Salamander|Salamandre|amp\n5|Newt|Triton|amp\n5|Axolotl||amp\n4|Tree frog|Rainette|amp\n4|Poison dart frog/Poison frog|Dendrobate/Grenouille venimeuse|amp\n3|Bullfrog|Ouaouaron/Grenouille-taureau|amp\n3|Cane toad|Crapaud buffle|amp aus\n2|Fire salamander|Salamandre tachetée|amp\n2|Caecilian|Cécilie|amp\n2|Mudpuppy|Necture|amp\n2|Olm|Protée|amp\n2|Hellbender|Ménopome|amp\n2|Giant salamander|Salamandre géante|amp\n2|Glass frog|Grenouille de verre|amp\n2|Goliath frog|Grenouille goliath|amp af\n2|Horned frog|Grenouille cornue|amp\n2|Natterjack toad|Crapaud calamite|amp\n2|Midwife toad|Alyte/Crapaud accoucheur|amp\n8|Bee|Abeille|ins\n8|Butterfly|Papillon|ins\n8|Ant|Fourmi|ins\n7|Fly|Mouche|ins\n7|Mosquito|Moustique|ins\n7|Ladybug/Ladybird|Coccinelle|ins\n7|Grasshopper|Sauterelle|ins\n7|Beetle|Scarabée/Coléoptère|ins\n6|Cricket|Grillon|ins\n6|Wasp|Guêpe|ins\n6|Dragonfly|Libellule|ins\n6|Cockroach|Cafard/Blatte|ins\n6|Moth|Papillon de nuit|ins\n6|Caterpillar|Chenille|ins\n6|Firefly|Luciole|ins\n5|Flea|Puce|ins\n5|Louse/Lice|Pou/Poux|ins\n5|Termite||ins\n5|Bumblebee|Bourdon|ins\n5|Hornet|Frelon|ins\n5|Praying mantis/Mantis|Mante religieuse/Mante|ins\n4|Stick insect|Phasme|ins\n5|Cicada|Cigale|ins\n4|Locust|Criquet|ins\n4|Earwig|Perce-oreille|ins\n3|Stag beetle|Lucane/Cerf-volant|ins\n3|Dung beetle|Bousier|ins\n3|Weevil|Charançon|ins\n3|Aphid|Puceron|ins\n3|Gnat|Moucheron|ins\n3|Horsefly|Taon|ins\n3|Bedbug/Bed bug|Punaise de lit|ins\n3|Stink bug/Shield bug|Punaise|ins\n3|Silverfish|Poisson d'argent|ins\n3|Monarch butterfly/Monarch|Monarque|ins\n2|Swallowtail|Machaon|ins\n3|Silkworm|Ver à soie|ins\n2|Mayfly|Éphémère|ins\n2|Damselfly|Demoiselle|ins\n2|Cockchafer/Maybug|Hanneton|ins\n2|Rhinoceros beetle|Scarabée rhinocéros|ins\n2|Goliath beetle|Goliath|ins af\n2|Hercules beetle|Dynaste Hercule|ins\n2|Colorado beetle/Potato beetle|Doryphore|ins\n2|Firebug|Gendarme|ins\n2|Water strider/Pond skater|Gerris/Araignée d'eau|ins\n2|Water boatman|Notonecte|ins\n2|Lacewing|Chrysope|ins\n2|Antlion|Fourmilion|ins\n2|Hoverfly|Syrphe|ins\n2|Fruit fly|Mouche du vinaigre/Drosophile|ins\n2|Tsetse fly|Mouche tsé-tsé|ins af\n2|Crane fly|Tipule|ins\n2|Bluebottle|Mouche bleue|ins\n2|Leafcutter ant|Fourmi coupe-feuille|ins\n2|Fire ant|Fourmi de feu|ins\n2|Army ant|Fourmi légionnaire|ins\n2|Carpenter bee|Abeille charpentière/Xylocope|ins\n2|Mole cricket|Courtilière|ins\n2|Scarab/Sacred scarab|Scarabée sacré|ins af\n2|Jewel beetle|Bupreste|ins\n2|Click beetle|Taupin|ins\n2|Longhorn beetle|Capricorne|ins\n2|Leaf insect|Phyllie|ins\n2|Atlas moth|Bombyx atlas/Papillon atlas|ins\n2|Hawk moth|Sphinx|ins\n2|Peacock butterfly|Paon-du-jour|ins\n2|Red admiral|Vulcain|ins\n2|Cabbage white|Piéride du chou|ins\n2|Morpho/Blue morpho|Morpho|ins\n2|Thrips||ins\n2|Mealworm|Ver de farine|ins\n2|Scale insect|Cochenille|ins\n8|Spider|Araignée|ara\n6|Scorpion||ara\n5|Tarantula|Tarentule/Mygale|ara\n4|Black widow|Veuve noire|ara\n4|Tick|Tique|ara\n3|Mite|Acarien|ara\n3|Daddy longlegs/Harvestman|Faucheux|ara\n2|Wolf spider|Lycose|ara\n2|Jumping spider|Araignée sauteuse/Saltique|ara\n2|Funnel-web spider|Atrax|ara aus\n2|Redback spider|Veuve noire australienne|ara aus\n2|Camel spider|Solifuge|ara\n2|Brown recluse/Recluse|Recluse brune|ara\n2|Orb weaver|Épeire|ara\n8|Crab|Crabe|crus sea\n7|Lobster|Homard|crus sea\n7|Shrimp/Prawn|Crevette|crus sea\n4|Crayfish|Écrevisse|crus\n4|Krill||crus sea arc\n3|Barnacle|Bernacle/Anatife|crus sea\n4|Hermit crab|Bernard-l'ermite|crus sea\n3|King crab|Crabe royal|crus sea\n3|Spider crab|Araignée de mer|crus sea\n3|Spiny lobster|Langouste|crus sea\n3|Langoustine||crus sea\n4|Woodlouse|Cloporte|crus\n2|Coconut crab|Crabe de cocotier|crus\n2|Mantis shrimp|Crevette-mante/Squille|crus sea\n3|Horseshoe crab|Limule|inv sea\n8|Octopus|Pieuvre/Poulpe|mol sea\n6|Squid|Calmar/Calamar|mol sea\n7|Snail|Escargot|mol\n6|Slug|Limace|mol\n4|Clam|Palourde|mol sea\n5|Oyster|Huître|mol sea\n5|Mussel|Moule|mol sea\n4|Scallop|Coquille Saint-Jacques|mol sea\n4|Cuttlefish|Seiche|mol sea\n3|Nautilus|Nautile|mol sea\n3|Giant squid|Calmar géant|mol sea\n2|Sea slug/Nudibranch|Limace de mer/Nudibranche|mol sea\n2|Cockle|Coque|mol sea\n2|Whelk|Bulot|mol sea\n2|Limpet|Patelle|mol sea\n2|Abalone|Ormeau|mol sea\n7|Jellyfish|Méduse|inv sea\n7|Starfish/Sea star|Étoile de mer|inv sea\n5|Sea urchin|Oursin|inv sea\n4|Coral|Corail|inv sea\n4|Sea anemone|Anémone de mer|inv sea\n3|Sponge|Éponge|inv sea\n3|Sea cucumber|Concombre de mer/Holothurie|inv sea\n6|Worm/Earthworm|Ver de terre/Ver|inv\n4|Leech|Sangsue|inv\n4|Centipede|Scolopendre|inv\n4|Millipede|Mille-pattes|inv\n3|Portuguese man o' war|Galère portugaise|inv sea\n2|Box jellyfish|Cuboméduse|inv sea\n3|Tardigrade||inv\n0|Unicorn|Licorne|no\n0|Dragon||no\n0|Phoenix|Phénix|no\n0|Mermaid|Sirène|no\n0|Griffin|Griffon|no\n0|Yeti|Yéti|no\n0|Pegasus|Pégase|no\n0|Dinosaur|Dinosaure|no\n0|T-Rex/Tyrannosaurus|T-Rex/Tyrannosaure|no\n0|Mammoth|Mammouth|no\n0|Animal||no\n0|Bird|Oiseau|no\n0|Fish|Poisson|no\n0|Insect|Insecte|no\n0|Mammal|Mammifère|no\n0|Reptile||no\n0|Human/Person|Humain/Homme|no"},"dogs":{"z":1,"d":["dog","dogs","chien","chiens"],"e":"9|Labrador/Labrador Retriever|Labrador|\n8|German Shepherd/Alsatian|Berger allemand|\n8|Golden Retriever||\n8|Poodle|Caniche|\n8|Bulldog/English Bulldog|Bulldog/Bouledogue anglais|\n8|Chihuahua||\n7|Husky/Siberian Husky|Husky/Husky sibérien|\n7|Dalmatian|Dalmatien|\n7|Beagle||\n7|Pug|Carlin|\n7|French Bulldog|Bouledogue français|\n7|Rottweiler||\n7|Yorkshire Terrier/Yorkie|Yorkshire/Yorkshire Terrier|\n6|Dachshund/Sausage dog|Teckel|\n6|Border Collie||\n6|Doberman/Dobermann||\n6|Great Dane|Dogue allemand|\n6|Shih Tzu||\n6|Boxer||\n6|Cocker Spaniel|Cocker|\n6|Pomeranian/Pom|Loulou de Poméranie/Spitz nain|\n6|Pit Bull/Pitbull|Pit-bull/Pitbull|\n6|Saint Bernard|Saint-Bernard|\n6|Greyhound|Lévrier/Greyhound|\n6|Jack Russell/Jack Russell Terrier||\n5|Corgi/Welsh Corgi|Corgi|\n5|Collie/Rough Collie|Colley|\n5|Maltese|Bichon maltais|\n5|Bichon Frise|Bichon frisé|\n5|Cavalier King Charles Spaniel/Cavalier King Charles|Cavalier King Charles|\n5|Shiba Inu||\n5|Akita/Akita Inu||\n5|Samoyed|Samoyède|\n5|Malamute/Alaskan Malamute||\n5|Bernese Mountain Dog|Bouvier bernois|\n5|Newfoundland|Terre-neuve|\n5|Bloodhound|Chien de Saint-Hubert|\n5|Basset Hound/Basset||\n5|Shar Pei||\n5|Chow Chow||\n5|Lhasa Apso||\n5|Pekingese|Pékinois|\n5|Schnauzer||\n5|Weimaraner|Braque de Weimar|\n5|Australian Shepherd|Berger australien|\n5|Belgian Malinois/Malinois|Malinois/Berger belge malinois|\n5|Bull Terrier||\n5|Staffordshire Bull Terrier/Staffie|Staffordshire/Staffie|\n5|Whippet||\n5|West Highland Terrier/Westie|Westie|\n5|Scottish Terrier/Scottie||\n5|Afghan Hound|Lévrier afghan|\n5|Mastiff|Mâtin/Dogue|\n3|Cane Corso||\n3|Bullmastiff||\n3|Dogue de Bordeaux||\n2|Rhodesian Ridgeback||\n2|Vizsla||\n3|Pointer||\n2|English Setter/Setter|Setter anglais|\n3|Irish Setter|Setter irlandais|\n3|Springer Spaniel|Springer|\n3|Brittany/Brittany Spaniel|Épagneul breton|\n3|Papillon|Papillon/Épagneul nain|\n2|Havanese|Bichon havanais|\n3|Shetland Sheepdog/Sheltie|Berger des Shetland|\n3|Old English Sheepdog/Bobtail|Bobtail|\n3|Airedale Terrier/Airedale||\n3|Fox Terrier||\n2|Cairn Terrier||\n3|Boston Terrier||\n3|Miniature Schnauzer|Schnauzer nain|\n2|Italian Greyhound|Petit lévrier italien|\n2|Saluki||\n3|Borzoi|Barzoï|\n3|Irish Wolfhound|Lévrier irlandais|\n2|Leonberger||\n3|Great Pyrenees/Pyrenean Mountain Dog|Montagne des Pyrénées/Patou|\n2|Pyrenean Shepherd|Berger des Pyrénées|\n3|Beauceron/Berger de Beauce||\n2|Briard/Berger de Brie||\n2|Belgian Shepherd/Groenendael|Berger belge/Groenendael|\n2|Tervuren||\n3|Basenji||\n3|Dingo||\n3|Xoloitzcuintli/Mexican Hairless Dog|Xoloitzcuintle/Chien nu du Mexique|\n3|Chinese Crested|Chien chinois à crête|\n2|Pharaoh Hound|Chien du pharaon|\n2|Komondor||\n2|Puli||\n2|Kuvasz||\n2|Anatolian Shepherd/Kangal|Berger d'Anatolie/Kangal|\n3|Tibetan Mastiff|Dogue du Tibet|\n2|Tibetan Terrier|Terrier tibétain|\n2|Keeshond||\n3|Spitz/German Spitz|Spitz/Spitz allemand|\n2|Japanese Spitz|Spitz japonais|\n2|Alaskan Klee Kai||\n3|Labradoodle||\n3|Cockapoo||\n3|Goldendoodle||\n2|Pomsky||\n2|Maltipoo||\n2|Coton de Tulear|Coton de Tuléar|\n2|Bolognese|Bichon bolonais|\n2|Affenpinscher||\n2|Miniature Pinscher/Min Pin|Pinscher nain|\n2|Brussels Griffon/Griffon|Griffon bruxellois|\n2|Norfolk Terrier||\n2|Norwich Terrier||\n2|Border Terrier||\n2|Bedlington Terrier||\n2|Kerry Blue Terrier||\n2|Wheaten Terrier/Soft-coated Wheaten Terrier||\n2|Dandie Dinmont Terrier||\n2|Skye Terrier||\n2|Sealyham Terrier||\n2|Lakeland Terrier||\n2|Welsh Terrier||\n2|Manchester Terrier||\n2|Rat Terrier||\n3|American Staffordshire Terrier/AmStaff|American Staffordshire/Amstaff|\n2|American Bully||\n3|Dogo Argentino|Dogue argentin|\n2|Fila Brasileiro||\n2|Presa Canario/Dogo Canario||\n2|Boerboel||\n2|Neapolitan Mastiff|Mâtin napolitain|\n2|Tosa/Tosa Inu||\n2|Hokkaido/Hokkaido Inu||\n2|Kishu||\n2|Jindo/Korean Jindo||\n2|Thai Ridgeback||\n2|Chinook||\n2|Coonhound||\n2|Foxhound||\n2|Harrier||\n2|Otterhound||\n2|Bluetick Coonhound||\n2|Plott Hound||\n2|Catahoula||\n3|Australian Cattle Dog/Blue Heeler/Heeler|Bouvier australien|\n2|Kelpie/Australian Kelpie||\n2|Bouvier des Flandres||\n2|Entlebucher||\n2|Appenzeller||\n2|Greater Swiss Mountain Dog|Grand bouvier suisse|\n2|Hovawart||\n2|Eurasier||\n2|Landseer||\n2|Flat-coated Retriever|Retriever à poil plat|\n2|Chesapeake Bay Retriever||\n2|Nova Scotia Duck Tolling Retriever/Toller||\n2|Curly-coated Retriever||\n2|Clumber Spaniel||\n2|Sussex Spaniel||\n2|Field Spaniel||\n2|Welsh Springer Spaniel||\n2|Irish Water Spaniel||\n3|German Shorthaired Pointer|Braque allemand|\n2|Bracco Italiano|Braque italien|\n2|Spinone Italiano||\n2|Lagotto Romagnolo||\n2|Portuguese Water Dog|Chien d'eau portugais|\n2|Spanish Water Dog|Chien d'eau espagnol|\n2|Barbet||\n2|Griffon Korthals/Wirehaired Pointing Griffon|Griffon Korthals|\n2|Braque d'Auvergne||\n2|Braque Français||\n2|Grand Bleu de Gascogne||\n2|Petit Basset Griffon Vendéen||\n0|Mongrel/Mutt|Bâtard|no\n0|Wolf|Loup|no\n0|Fox|Renard|no"},"prehistoric":{"z":1,"d":[],"e":"9|Tyrannosaurus/Tyrannosaurus rex/T. rex/T-Rex/T rex|Tyrannosaure/T-Rex/Tyrannosaurus|dino\n8|Triceratops||dino\n8|Velociraptor/Raptor||dino\n8|Stegosaurus|Stégosaure|dino\n8|Brachiosaurus|Brachiosaure|dino\n7|Diplodocus||dino\n7|Pterodactyl/Pterodactylus|Ptérodactyle|fly\n7|Spinosaurus|Spinosaure|dino\n6|Ankylosaurus|Ankylosaure|dino\n6|Brontosaurus|Brontosaure|dino\n6|Mammoth/Woolly mammoth|Mammouth/Mammouth laineux|mam\n6|Megalodon|Mégalodon|sea\n6|Sabre-toothed tiger/Saber-toothed tiger/Smilodon/Saber-tooth|Tigre à dents de sabre/Smilodon|mam\n6|Pteranodon|Ptéranodon|fly\n6|Allosaurus|Allosaure|dino\n6|Iguanodon||dino\n6|Parasaurolophus||dino\n5|Apatosaurus|Apatosaure|dino\n5|Pachycephalosaurus|Pachycéphalosaure|dino\n5|Archaeopteryx|Archéoptéryx|dino\n5|Dilophosaurus|Dilophosaure|dino\n5|Carnotaurus||dino\n5|Giganotosaurus|Giganotosaure|dino\n5|Mosasaurus|Mosasaure|sea\n5|Plesiosaurus/Plesiosaur|Plésiosaure|sea\n5|Ichthyosaurus/Ichthyosaur|Ichtyosaure|sea\n5|Argentinosaurus|Argentinosaure|dino\n5|Compsognathus||dino\n5|Oviraptor||dino\n5|Gallimimus||dino\n5|Baryonyx||dino\n5|Therizinosaurus|Thérizinosaure|dino\n5|Dimetrodon||other\n5|Trilobite||other\n5|Dodo||no\n3|Deinonychus||dino\n3|Utahraptor||dino\n3|Microraptor||dino\n3|Protoceratops||dino\n3|Styracosaurus|Styracosaure|dino\n2|Pachyrhinosaurus||dino\n2|Centrosaurus||dino\n2|Torosaurus||dino\n3|Edmontosaurus|Edmontosaure|dino\n2|Maiasaura||dino\n2|Corythosaurus||dino\n2|Lambeosaurus||dino\n2|Hadrosaurus|Hadrosaure|dino\n2|Shantungosaurus||dino\n2|Euoplocephalus||dino\n2|Nodosaurus||dino\n2|Kentrosaurus||dino\n2|Camarasaurus||dino\n2|Mamenchisaurus||dino\n2|Supersaurus||dino\n2|Titanosaurus/Titanosaur|Titanosaure|dino\n2|Dreadnoughtus||dino\n2|Patagotitan||dino\n2|Plateosaurus||dino\n3|Coelophysis||dino\n2|Herrerasaurus||dino\n2|Eoraptor||dino\n2|Ceratosaurus||dino\n3|Megalosaurus|Mégalosaure|dino\n3|Albertosaurus||dino\n2|Gorgosaurus||dino\n2|Daspletosaurus||dino\n2|Tarbosaurus||dino\n2|Yutyrannus||dino\n2|Carcharodontosaurus||dino\n2|Acrocanthosaurus||dino\n2|Suchomimus||dino\n2|Irritator||dino\n2|Troodon||dino\n2|Struthiomimus||dino\n2|Ornithomimus||dino\n2|Deinocheirus||dino\n2|Psittacosaurus||dino\n2|Minmi||dino\n2|Leaellynasaura||dino\n2|Muttaburrasaurus||dino\n2|Amargasaurus||dino\n2|Nigersaurus||dino\n2|Ouranosaurus||dino\n2|Sauropelta||dino\n2|Gastonia||dino\n2|Borealopelta||dino\n2|Concavenator||dino\n2|Majungasaurus||dino\n2|Abelisaurus||dino\n3|Quetzalcoatlus||fly\n2|Rhamphorhynchus||fly\n2|Dimorphodon||fly\n3|Elasmosaurus||sea\n3|Liopleurodon||sea\n2|Kronosaurus||sea\n2|Shonisaurus||sea\n2|Tylosaurus||sea\n3|Dunkleosteus||sea\n2|Anomalocaris||sea\n3|Ammonite||sea\n2|Helicoprion||sea\n2|Basilosaurus||sea\n2|Archelon||sea\n3|Megatherium/Giant ground sloth|Mégathérium/Paresseux géant|mam\n3|Woolly rhinoceros/Woolly rhino|Rhinocéros laineux|mam\n3|Mastodon|Mastodonte|mam\n3|Cave bear|Ours des cavernes|mam\n2|Cave lion|Lion des cavernes|mam\n2|Irish elk/Megaloceros|Mégacéros|mam\n2|Glyptodon||mam\n2|Paraceratherium/Indricotherium||mam\n2|Deinotherium||mam\n2|Andrewsarchus||mam\n2|Diprotodon||mam\n3|Thylacine/Tasmanian tiger|Thylacine/Tigre de Tasmanie|mam\n2|Megalania||other\n2|Sarcosuchus||other\n2|Deinosuchus||other\n3|Titanoboa||other\n2|Meganeura||other\n2|Arthropleura||other\n2|Gigantopithecus||mam\n2|Phorusrhacos/Terror bird|Oiseau-terreur|other\n2|Gastornis/Diatryma||other\n3|Moa||other\n2|Elephant bird|Oiseau-éléphant/Æpyornis|other\n2|Haast's eagle|Aigle de Haast|other\n2|Tiktaalik||other\n2|Ichthyostega||other\n2|Lystrosaurus||other\n2|Edaphosaurus||other\n2|Postosuchus||other\n2|Placodus||sea\n2|Nothosaurus||sea\n2|Eurypterid/Sea scorpion|Euryptéride|sea\n0|Dragon||no\n0|Godzilla||no\n0|Crocodile||no\n0|Shark|Requin|no"},"trees":{"z":1,"d":["tree","trees","arbre","arbres"],"e":"8|Oak|Chêne|\n7|Pine|Pin|conifer\n7|Palm/Palm tree|Palmier|\n7|Apple tree|Pommier|fruit\n6|Birch|Bouleau|\n6|Maple|Érable|\n6|Willow/Weeping willow|Saule/Saule pleureur|\n6|Fir|Sapin|conifer\n6|Christmas tree|Sapin de Noël|conifer\n6|Cherry tree/Cherry blossom|Cerisier|fruit\n6|Baobab||\n6|Beech|Hêtre|\n6|Spruce|Épicéa|conifer\n6|Olive tree|Olivier|fruit\n6|Redwood/Sequoia/Giant sequoia|Séquoia|conifer\n5|Ash|Frêne|\n5|Elm|Orme|\n5|Poplar|Peuplier|\n5|Chestnut/Sweet chestnut|Châtaignier|\n5|Horse chestnut|Marronnier|\n5|Cedar|Cèdre|conifer\n5|Cypress|Cyprès|conifer\n5|Yew|If|conifer\n5|Larch|Mélèze|conifer\n5|Eucalyptus||\n5|Bamboo|Bambou|no\n5|Lemon tree|Citronnier|fruit\n5|Orange tree|Oranger|fruit\n5|Pear tree|Poirier|fruit\n5|Plum tree|Prunier|fruit\n5|Peach tree|Pêcher|fruit\n5|Walnut/Walnut tree|Noyer|fruit\n5|Coconut palm/Coconut tree|Cocotier|fruit\n5|Fig tree|Figuier|fruit\n5|Banana tree|Bananier|fruit\n5|Mango tree|Manguier|fruit\n5|Magnolia||\n5|Lime/Linden|Tilleul|\n5|Plane tree|Platane|\n5|Sycamore|Sycomore|\n5|Hazel|Noisetier|fruit\n5|Holly|Houx|\n5|Acacia||\n5|Mimosa||\n5|Jacaranda||\n5|Bonsai|Bonsaï|no\n3|Hornbeam|Charme|\n3|Alder|Aulne|\n3|Rowan/Mountain ash|Sorbier|\n3|Hawthorn|Aubépine|\n3|Juniper|Genévrier|conifer\n3|Douglas fir|Douglas/Sapin de Douglas|conifer\n2|Scots pine|Pin sylvestre|conifer\n2|Umbrella pine/Stone pine|Pin parasol|conifer\n3|Monkey puzzle/Monkey puzzle tree|Désespoir des singes/Araucaria|conifer\n3|Ginkgo/Ginkgo biloba||\n3|Teak|Teck|\n3|Mahogany|Acajou|\n3|Ebony|Ébène/Ébénier|\n2|Rosewood|Palissandre|\n2|Sandalwood|Santal|\n3|Balsa||\n3|Cork oak|Chêne-liège|\n2|Holm oak|Chêne vert|\n3|Aspen|Tremble|\n2|Cottonwood||\n2|Hickory|Caryer|\n2|Pecan|Pacanier|fruit\n3|Almond tree|Amandier|fruit\n3|Apricot tree|Abricotier|fruit\n3|Avocado tree|Avocatier|fruit\n3|Cocoa tree/Cacao|Cacaoyer/Cacaotier|fruit\n2|Coffee tree|Caféier|fruit\n3|Rubber tree|Hévéa|\n2|Kapok/Ceiba|Fromager/Kapokier|\n3|Mangrove|Palétuvier/Mangrove|\n3|Banyan|Banian|\n3|Date palm|Palmier dattier|fruit\n3|Joshua tree|Arbre de Josué|\n2|Dragon tree|Dragonnier|\n2|Bottle tree||\n2|Tulip tree|Tulipier|\n2|Dogwood|Cornouiller|\n3|Elder/Elderberry|Sureau|\n3|Laurel/Bay tree|Laurier|\n2|Myrtle|Myrte|\n2|Tamarind|Tamarinier|fruit\n2|Pomegranate tree|Grenadier|fruit\n2|Quince tree|Cognassier|fruit\n2|Medlar|Néflier|fruit\n3|Mulberry|Mûrier|fruit\n2|Catalpa||\n2|Paulownia||\n2|Wisteria|Glycine|no\n3|Box/Boxwood|Buis|\n2|Tamarisk|Tamaris|\n2|Hemlock|Pruche|conifer\n2|Atlas cedar|Cèdre de l'Atlas|conifer\n2|Cedar of Lebanon|Cèdre du Liban|conifer\n2|Thuja/Arborvitae|Thuya|conifer\n2|Wollemi pine||conifer\n2|Bristlecone pine||conifer\n2|Baldcypress/Bald cypress|Cyprès chauve|conifer\n2|Metasequoia/Dawn redwood|Métaséquoia|conifer\n2|Japanese maple|Érable du Japon|\n2|Cinnamon tree|Cannelier|\n2|Clove tree|Giroflier|\n2|Nutmeg tree|Muscadier|\n2|Breadfruit|Arbre à pain|fruit\n2|Jackfruit tree|Jacquier|fruit\n2|Lychee tree|Litchi|fruit\n2|Neem|Neem/Margousier|\n2|Sal||\n2|Peepal/Sacred fig/Bodhi tree|Figuier des pagodes|\n2|Camphor tree|Camphrier|\n0|Rose||no\n0|Sunflower|Tournesol|no"},"flowers":{"z":1,"d":["flower","flowers","fleur","fleurs"],"e":"9|Rose||\n8|Tulip|Tulipe|\n8|Sunflower|Tournesol|\n7|Daisy|Marguerite/Pâquerette|\n7|Lily|Lys/Lis|\n7|Orchid|Orchidée|\n7|Daffodil|Jonquille/Narcisse|\n6|Lavender|Lavande|\n6|Poppy|Coquelicot/Pavot|\n6|Lotus||\n6|Dandelion|Pissenlit|\n6|Carnation|Œillet|\n6|Violet|Violette|\n6|Hibiscus||\n6|Cherry blossom/Sakura|Fleur de cerisier/Sakura|\n5|Jasmine|Jasmin|\n5|Peony|Pivoine|\n5|Iris||\n5|Lilac|Lilas|\n5|Chrysanthemum|Chrysanthème|\n5|Hydrangea|Hortensia|\n5|Magnolia||\n5|Gerbera||\n5|Marigold|Souci/Œillet d'Inde|\n5|Geranium|Géranium|\n5|Pansy|Pensée|\n5|Forget-me-not|Myosotis|\n5|Lily of the valley|Muguet|\n5|Bluebell|Jacinthe des bois|\n5|Hyacinth|Jacinthe|\n5|Crocus||\n5|Snowdrop|Perce-neige|\n5|Begonia|Bégonia|\n5|Petunia|Pétunia|\n5|Dahlia||\n5|Camellia|Camélia|\n5|Gardenia|Gardénia|\n5|Azalea|Azalée|\n5|Rhododendron||\n5|Buttercup|Bouton d'or|\n5|Clover|Trèfle|\n5|Cornflower|Bleuet|\n5|Edelweiss||\n5|Water lily|Nénuphar|\n5|Bird of paradise/Strelitzia|Oiseau de paradis/Strelitzia|\n5|Cactus flower|Fleur de cactus|no\n3|Zinnia||\n3|Cosmos||\n3|Aster||\n3|Anemone|Anémone|\n3|Ranunculus|Renoncule|\n3|Freesia||\n3|Gladiolus|Glaïeul|\n3|Amaryllis||\n3|Calla lily|Arum/Calla|\n3|Anthurium||\n3|Protea||\n3|Bougainvillea|Bougainvillier|\n3|Wisteria|Glycine|\n3|Honeysuckle|Chèvrefeuille|\n3|Foxglove|Digitale|\n3|Snapdragon|Muflier/Gueule-de-loup|\n3|Sweet pea|Pois de senteur|\n3|Lupin||\n3|Delphinium/Larkspur|Delphinium/Pied-d'alouette|\n3|Hollyhock|Rose trémière|\n3|Primrose|Primevère|\n3|Cyclamen||\n3|Fuchsia||\n3|Impatiens/Busy Lizzie|Impatiens|\n3|Lobelia|Lobélie|\n3|Verbena|Verveine|\n3|Heather|Bruyère|\n3|Gorse|Ajonc|\n3|Broom|Genêt|\n3|Thistle|Chardon|\n3|Gentian|Gentiane|\n3|Columbine|Ancolie|\n3|Bellflower/Campanula|Campanule|\n3|Morning glory|Volubilis/Ipomée|\n3|Passion flower|Passiflore|\n3|Plumeria/Frangipani|Frangipanier|\n3|Oleander|Laurier-rose|\n3|Mimosa||\n3|Jacaranda||\n3|Lantana||\n3|Salvia|Sauge|\n3|Nasturtium|Capucine|\n3|Periwinkle|Pervenche|\n3|Stock|Giroflée|\n3|Wallflower|Giroflée des murailles|\n3|Aubrieta|Aubriète|\n3|Allium||\n3|Agapanthus|Agapanthe|\n3|Alstroemeria|Alstroemère|\n3|Statice||\n3|Gypsophila/Baby's breath|Gypsophile|\n3|Celosia|Célosie|\n3|Clematis|Clématite|\n3|Rafflesia||\n3|Corpse flower/Titan arum|Arum titan|\n3|Venus flytrap|Dionée/Attrape-mouche|\n3|Orange blossom|Fleur d'oranger|\n3|Apple blossom|Fleur de pommier|\n3|Poinsettia|Poinsettia/Étoile de Noël|\n3|Saffron crocus|Crocus à safran|\n3|Chamomile|Camomille|\n3|Elderflower|Fleur de sureau|\n3|Hellebore/Christmas rose|Hellébore/Rose de Noël|\n3|Tuberose|Tubéreuse|\n3|Peace lily|Spathiphyllum|\n3|Moonflower||\n3|Black-eyed Susan/Rudbeckia|Rudbeckia|\n3|Coneflower/Echinacea|Échinacée|\n3|Yarrow|Achillée|\n3|Evening primrose|Onagre|\n3|Bleeding heart|Cœur-de-Marie|\n3|Sea holly|Panicaut|\n3|Tansy|Tanaisie|\n0|Tree|Arbre|no\n0|Grass|Herbe|no"},"us_presidents":{"z":1,"d":["president"],"e":"4|George Washington/Washington||\n2|John Adams||\n5|Thomas Jefferson/Jefferson||\n2|James Madison/Madison||\n2|James Monroe/Monroe||\n1|John Quincy Adams||\n3|Andrew Jackson/Jackson||\n1|Martin Van Buren/Van Buren||\n1|William Henry Harrison||\n1|John Tyler/Tyler||\n1|James K. Polk/James Polk/Polk||\n1|Zachary Taylor||\n1|Millard Fillmore/Fillmore||\n1|Franklin Pierce/Pierce||\n1|James Buchanan/Buchanan||\n6|Abraham Lincoln/Lincoln/Abe Lincoln||\n1|Andrew Johnson||\n2|Ulysses S. Grant/Ulysses Grant/Grant||\n1|Rutherford B. Hayes/Hayes||\n1|James A. Garfield/James Garfield/Garfield||\n1|Chester A. Arthur/Chester Arthur||\n1|Grover Cleveland/Cleveland||\n1|Benjamin Harrison||\n1|William McKinley/McKinley||\n3|Theodore Roosevelt/Teddy Roosevelt||\n1|William Howard Taft/Taft||\n2|Woodrow Wilson/Wilson||\n1|Warren G. Harding/Harding||\n1|Calvin Coolidge/Coolidge||\n1|Herbert Hoover/Hoover||\n3|Franklin D. Roosevelt/Franklin Roosevelt/FDR/Roosevelt||\n2|Harry S. Truman/Harry Truman/Truman||\n2|Dwight D. Eisenhower/Dwight Eisenhower/Eisenhower/Ike||\n5|John F. Kennedy/John Kennedy/JFK/Kennedy||\n1|Lyndon B. Johnson/Lyndon Johnson/LBJ||\n3|Richard Nixon/Nixon||\n1|Gerald Ford/Ford||\n2|Jimmy Carter/Carter||\n3|Ronald Reagan/Reagan||\n1|George H. W. Bush/George Bush Senior||\n3|Bill Clinton/Clinton||\n3|George W. Bush/George Bush/Bush||\n7|Barack Obama/Obama||\n7|Donald Trump/Trump||\n5|Joe Biden/Biden||\n0|Kamala Harris||no\n0|Hillary Clinton||no\n0|Benjamin Franklin/Franklin||no\n0|Alexander Hamilton/Hamilton||no\n0|Martin Luther King||no"},"fr_presidents":{"z":1,"d":["president"],"e":"7|Emmanuel Macron/Macron||\n6|Charles de Gaulle/De Gaulle/Gaulle||\n5|François Hollande/Hollande||\n5|Nicolas Sarkozy/Sarkozy||\n5|Jacques Chirac/Chirac||\n4|François Mitterrand/Mitterrand||\n3|Valéry Giscard d'Estaing/Giscard d'Estaing/Giscard/VGE||\n3|Georges Pompidou/Pompidou||\n2|Alain Poher/Poher||\n1|René Coty/Coty||\n1|Vincent Auriol/Auriol||\n1|Albert Lebrun/Lebrun||\n1|Paul Doumer/Doumer||\n1|Gaston Doumergue/Doumergue||\n1|Alexandre Millerand/Millerand||\n1|Paul Deschanel/Deschanel||\n1|Raymond Poincaré/Poincaré||\n1|Armand Fallières/Fallières||\n1|Émile Loubet/Loubet||\n1|Félix Faure||\n1|Jean Casimir-Perier/Casimir-Perier||\n1|Sadi Carnot/Carnot||\n1|Jules Grévy/Grévy||\n1|Patrice de Mac Mahon/Mac Mahon/MacMahon||\n1|Adolphe Thiers/Thiers||\n2|Louis-Napoléon Bonaparte/Louis-Napoléon||\n0|Napoléon/Napoleon Bonaparte|Napoléon/Napoléon Bonaparte|no\n0|Marine Le Pen/Le Pen||no\n0|Louis XIV/Louis 14||no\n0|Jean-Luc Mélenchon/Mélenchon||no\n0|Gabriel Attal/Attal||no\n0|Édouard Philippe||no"},"scientists":{"z":1,"d":[],"e":"9|Albert Einstein/Einstein||\n8|Isaac Newton/Newton||\n7|Marie Curie/Marie Skłodowska-Curie/Curie||\n7|Charles Darwin/Darwin||\n6|Galileo/Galileo Galilei/Galilée|Galilée|\n6|Nikola Tesla/Tesla||\n6|Stephen Hawking/Hawking||\n5|Thomas Edison/Edison||\n5|Louis Pasteur/Pasteur||\n5|Archimedes/Archimède|Archimède|\n5|Leonardo da Vinci/Da Vinci/Leonardo|Léonard de Vinci/De Vinci|\n5|Nicolaus Copernicus/Copernicus|Nicolas Copernic/Copernic|\n5|Pythagoras|Pythagore|\n5|Alexander Graham Bell/Graham Bell||\n4|Johannes Kepler/Kepler||\n3|Michael Faraday/Faraday||\n2|James Clerk Maxwell/Maxwell||\n3|Max Planck/Planck||\n3|Niels Bohr/Bohr||\n3|Ernest Rutherford/Rutherford||\n3|Richard Feynman/Feynman||\n4|Alan Turing/Turing||\n4|Ada Lovelace/Lovelace||\n3|Gregor Mendel/Mendel||\n4|Alexander Fleming/Fleming||\n3|Dmitri Mendeleev/Mendeleev|Dmitri Mendeleïev/Mendeleïev|\n3|Euclid|Euclide|\n4|Aristotle|Aristote|\n3|Hippocrates|Hippocrate|\n4|Robert Oppenheimer/J. Robert Oppenheimer/Oppenheimer||\n3|Pierre Curie||\n4|Benjamin Franklin/Franklin||\n3|Carl Sagan/Sagan||\n2|Neil deGrasse Tyson||\n3|Jane Goodall/Goodall||\n3|Rosalind Franklin||\n3|Edwin Hubble/Hubble||\n2|Werner Heisenberg/Heisenberg||\n3|Erwin Schrödinger/Schrödinger/Schrodinger||\n2|Enrico Fermi/Fermi||\n3|Alfred Nobel/Nobel||\n3|Antoine Lavoisier/Lavoisier||\n3|Blaise Pascal/Pascal||\n3|René Descartes/Descartes||\n2|Pierre de Fermat/Fermat||\n2|Leonhard Euler/Euler||\n2|Carl Friedrich Gauss/Gauss||\n2|Gottfried Leibniz/Leibniz||\n2|Robert Hooke/Hooke||\n2|Robert Boyle/Boyle||\n2|Edmond Halley/Halley||\n2|Tycho Brahe/Brahe||\n2|Christiaan Huygens/Huygens||\n3|Alessandro Volta/Volta||\n2|André-Marie Ampère/Ampère||\n2|Georg Ohm/Ohm||\n3|James Watt/Watt||\n2|Heinrich Hertz/Hertz||\n2|Guglielmo Marconi/Marconi||\n2|Wilhelm Röntgen/Röntgen/Roentgen||\n2|Henri Becquerel/Becquerel||\n2|Irène Joliot-Curie||\n2|Lise Meitner/Meitner||\n2|Paul Dirac/Dirac||\n2|Wolfgang Pauli/Pauli||\n2|Max Born||\n2|Louis de Broglie/De Broglie||\n2|Peter Higgs/Higgs||\n2|Edward Jenner/Jenner||\n2|Joseph Lister/Lister||\n2|Robert Koch/Koch||\n3|Florence Nightingale||\n4|Sigmund Freud/Freud||\n3|Ivan Pavlov/Pavlov||\n2|Carl Linnaeus/Linnaeus|Carl von Linné/Linné|\n2|Jean-Baptiste Lamarck/Lamarck||\n2|Georges Cuvier/Cuvier||\n2|Alfred Russel Wallace||\n2|James Watson||\n2|Francis Crick/Crick||\n2|Barbara McClintock/McClintock||\n2|Rachel Carson||\n2|Alexander von Humboldt/Humboldt||\n2|Dian Fossey/Fossey||\n3|Jacques Cousteau/Cousteau|Jacques-Yves Cousteau/Cousteau|\n2|Katherine Johnson||\n2|Hedy Lamarr||\n2|Grace Hopper||\n3|Tim Berners-Lee/Berners-Lee||\n2|John von Neumann/Von Neumann||\n2|Claude Shannon/Shannon||\n2|Srinivasa Ramanujan/Ramanujan||\n2|Emmy Noether/Noether||\n2|Sophie Germain||\n2|Hypatia/Hypatie|Hypatie|\n2|Ptolemy|Ptolémée|\n2|Eratosthenes|Ératosthène|\n2|Avicenna/Ibn Sina|Avicenne/Ibn Sina|\n2|Al-Khwarizmi||\n2|Ibn al-Haytham/Alhazen||\n2|Omar Khayyam||\n2|Zhang Heng||\n2|Shen Kuo||\n2|Joseph Fourier/Fourier||\n2|Pierre-Simon Laplace/Laplace||\n2|Joseph-Louis Lagrange/Lagrange||\n2|Évariste Galois/Galois||\n2|Henri Poincaré/Poincaré||\n2|Augustin Fresnel/Fresnel||\n2|Léon Foucault/Foucault||\n3|Gustave Eiffel/Eiffel||\n2|Claude Bernard||\n2|Urbain Le Verrier/Le Verrier||\n2|Charles Messier/Messier||\n2|Jean-François Champollion/Champollion||\n2|Hubert Reeves||\n0|Elon Musk||no\n0|Bill Gates||no\n0|Steve Jobs||no"},"painters":{"z":1,"d":[],"e":"9|Leonardo da Vinci/Da Vinci/Leonardo|Léonard de Vinci/De Vinci|\n8|Pablo Picasso/Picasso||\n8|Vincent van Gogh/Van Gogh||\n7|Claude Monet/Monet||\n7|Michelangelo|Michel-Ange|\n6|Salvador Dalí/Dali/Dalí||\n6|Rembrandt||\n6|Frida Kahlo/Kahlo||\n6|Andy Warhol/Warhol||\n5|Raphael|Raphaël|\n5|Pierre-Auguste Renoir/Renoir||\n5|Paul Cézanne/Cézanne/Cezanne||\n5|Édouard Manet/Manet||\n5|Edgar Degas/Degas||\n5|Henri Matisse/Matisse||\n5|Johannes Vermeer/Vermeer||\n5|Gustav Klimt/Klimt||\n5|Edvard Munch/Munch||\n5|Banksy||\n5|Paul Gauguin/Gauguin||\n5|Jackson Pollock/Pollock||\n4|Sandro Botticelli/Botticelli||\n4|Caravaggio|Le Caravage/Caravage|\n3|Titian|Titien/Le Titien|\n4|Donatello||\n3|Diego Velázquez/Velázquez/Velazquez||\n3|Francisco Goya/Goya||\n3|El Greco|Le Greco|\n3|Peter Paul Rubens/Rubens||\n3|Jan van Eyck/Van Eyck||\n3|Hieronymus Bosch/Bosch|Jérôme Bosch/Bosch|\n3|Pieter Bruegel/Bruegel/Brueghel||\n3|Albrecht Dürer/Dürer/Durer||\n3|J. M. W. Turner/William Turner/Turner||\n2|John Constable/Constable||\n2|Caspar David Friedrich||\n4|Eugène Delacroix/Delacroix||\n2|Jacques-Louis David||\n2|Jean-Auguste-Dominique Ingres/Ingres||\n3|Gustave Courbet/Courbet||\n2|Jean-François Millet/Millet||\n3|Camille Pissarro/Pissarro||\n2|Alfred Sisley/Sisley||\n2|Berthe Morisot/Morisot||\n2|Mary Cassatt/Cassatt||\n3|Georges Seurat/Seurat||\n3|Henri de Toulouse-Lautrec/Toulouse-Lautrec||\n2|Gustave Caillebotte/Caillebotte||\n2|Henri Rousseau/Le Douanier Rousseau||\n4|Wassily Kandinsky/Kandinsky||\n3|Piet Mondrian/Mondrian||\n3|Paul Klee/Klee||\n3|Joan Miró/Miró/Miro||\n4|René Magritte/Magritte||\n3|Marc Chagall/Chagall||\n3|Amedeo Modigliani/Modigliani||\n2|Georges Braque/Braque||\n2|Fernand Léger/Léger||\n2|Marcel Duchamp/Duchamp||\n3|Egon Schiele/Schiele||\n3|Mark Rothko/Rothko||\n3|Roy Lichtenstein/Lichtenstein||\n3|Keith Haring/Haring||\n4|Jean-Michel Basquiat/Basquiat||\n3|David Hockney/Hockney||\n3|Edward Hopper/Hopper||\n2|Georgia O'Keeffe/O'Keeffe||\n2|Norman Rockwell/Rockwell||\n3|Yves Klein||\n3|Pierre Soulages/Soulages||\n2|Nicolas de Staël/De Staël||\n2|Bernard Buffet/Buffet||\n2|Jean Dubuffet/Dubuffet||\n3|Yayoi Kusama/Kusama||\n3|Katsushika Hokusai/Hokusai||\n2|Utagawa Hiroshige/Hiroshige||\n3|Diego Rivera/Rivera||\n3|Fernando Botero/Botero||\n2|Tamara de Lempicka/Lempicka||\n2|Artemisia Gentileschi/Gentileschi||\n2|Élisabeth Vigée Le Brun/Vigée Le Brun||\n3|Giotto||\n2|Fra Angelico||\n2|Piero della Francesca||\n2|Andrea Mantegna/Mantegna||\n2|Giovanni Bellini/Bellini||\n2|Tintoretto|Le Tintoret/Tintoret|\n2|Paolo Veronese/Veronese|Véronèse|\n2|Canaletto||\n2|Nicolas Poussin/Poussin||\n2|Claude Lorrain/Lorrain||\n2|Georges de La Tour||\n2|Antoine Watteau/Watteau||\n2|Jean-Honoré Fragonard/Fragonard||\n2|François Boucher/Boucher||\n2|Jean-Baptiste-Siméon Chardin/Chardin||\n2|Théodore Géricault/Géricault||\n2|William Blake/Blake||\n2|Dante Gabriel Rossetti/Rossetti||\n2|John Everett Millais/Millais||\n2|James McNeill Whistler/Whistler||\n2|John Singer Sargent/Sargent||\n3|Alphonse Mucha/Mucha||\n2|Odilon Redon/Redon||\n2|Gustave Moreau/Moreau||\n2|Paul Signac/Signac||\n2|Raoul Dufy/Dufy||\n2|André Derain/Derain||\n2|Maurice de Vlaminck/Vlaminck||\n2|Maurice Utrillo/Utrillo||\n2|Suzanne Valadon/Valadon||\n2|Francis Bacon||\n2|Lucian Freud||\n2|Gerhard Richter/Richter||\n2|Ai Weiwei||\n3|Jeff Koons/Koons||\n3|Damien Hirst/Hirst||\n4|Bob Ross||\n0|Auguste Rodin/Rodin||no\n0|Leonardo DiCaprio/DiCaprio||no"},"composers":{"z":1,"d":[],"e":"9|Wolfgang Amadeus Mozart/Mozart||\n9|Ludwig van Beethoven/Beethoven||\n8|Johann Sebastian Bach/Bach/J. S. Bach||\n7|Frédéric Chopin/Chopin||\n6|Antonio Vivaldi/Vivaldi||\n6|Pyotr Ilyich Tchaikovsky/Tchaikovsky|Piotr Ilitch Tchaïkovski/Tchaïkovski|\n5|Johannes Brahms/Brahms||\n5|Joseph Haydn/Haydn||\n5|George Frideric Handel/Handel|Georg Friedrich Haendel/Haendel|\n5|Franz Schubert/Schubert||\n5|Richard Wagner/Wagner||\n5|Giuseppe Verdi/Verdi||\n5|Claude Debussy/Debussy||\n5|Maurice Ravel/Ravel||\n5|Antonín Dvořák/Dvorak/Dvořák||\n5|Franz Liszt/Liszt||\n5|Felix Mendelssohn/Mendelssohn||\n5|Robert Schumann/Schumann||\n5|Giacomo Puccini/Puccini||\n5|Erik Satie/Satie||\n5|Johann Strauss/Strauss||\n5|Hans Zimmer/Zimmer||\n5|John Williams||\n4|Igor Stravinsky/Stravinsky|Igor Stravinski/Stravinski|\n4|Sergei Rachmaninoff/Rachmaninoff/Rachmaninov|Sergueï Rachmaninov/Rachmaninov|\n3|Sergei Prokofiev/Prokofiev|Sergueï Prokofiev|\n2|Dmitri Shostakovich/Shostakovich|Dmitri Chostakovitch/Chostakovitch|\n3|Gustav Mahler/Mahler||\n2|Richard Strauss||\n3|Camille Saint-Saëns/Saint-Saëns/Saint-Saens||\n4|Georges Bizet/Bizet||\n3|Hector Berlioz/Berlioz||\n3|Gabriel Fauré/Fauré||\n2|Jules Massenet/Massenet||\n2|Charles Gounod/Gounod||\n3|Jacques Offenbach/Offenbach||\n2|Léo Delibes/Delibes||\n2|César Franck/Franck||\n2|Francis Poulenc/Poulenc||\n2|Darius Milhaud/Milhaud||\n2|Olivier Messiaen/Messiaen||\n2|Pierre Boulez/Boulez||\n3|Jean-Philippe Rameau/Rameau||\n3|Jean-Baptiste Lully/Lully||\n2|François Couperin/Couperin||\n2|Marc-Antoine Charpentier||\n3|Claudio Monteverdi/Monteverdi||\n2|Henry Purcell/Purcell||\n4|Gioachino Rossini/Rossini||\n2|Gaetano Donizetti/Donizetti||\n2|Vincenzo Bellini||\n3|Niccolò Paganini/Paganini||\n2|Arcangelo Corelli/Corelli||\n2|Domenico Scarlatti/Scarlatti||\n2|Tomaso Albinoni/Albinoni||\n3|Johann Pachelbel/Pachelbel||\n2|Georg Philipp Telemann/Telemann||\n2|Christoph Willibald Gluck/Gluck||\n2|Anton Bruckner/Bruckner||\n3|Edvard Grieg/Grieg||\n2|Jean Sibelius/Sibelius||\n2|Carl Nielsen/Nielsen||\n2|Bedřich Smetana/Smetana||\n2|Leoš Janáček/Janacek||\n2|Béla Bartók/Bartok/Bartók||\n2|Zoltán Kodály/Kodaly||\n3|Modest Mussorgsky/Mussorgsky|Modeste Moussorgski/Moussorgski|\n3|Nikolai Rimsky-Korsakov/Rimsky-Korsakov|Nikolaï Rimski-Korsakov/Rimski-Korsakov|\n2|Alexander Borodin/Borodin|Alexandre Borodine/Borodine|\n2|Mikhail Glinka/Glinka||\n2|Aram Khachaturian/Khachaturian|Aram Khatchatourian|\n3|Edward Elgar/Elgar||\n3|Gustav Holst/Holst||\n2|Ralph Vaughan Williams/Vaughan Williams||\n2|Benjamin Britten/Britten||\n3|George Gershwin/Gershwin||\n3|Leonard Bernstein/Bernstein||\n2|Aaron Copland/Copland||\n2|Samuel Barber/Barber||\n3|Philip Glass||\n2|Steve Reich||\n2|John Cage/Cage||\n2|Arnold Schoenberg/Schoenberg|Arnold Schönberg/Schönberg|\n2|Alban Berg||\n2|Anton Webern/Webern||\n2|Isaac Albéniz/Albéniz||\n2|Manuel de Falla/De Falla||\n2|Joaquín Rodrigo/Rodrigo||\n2|Enrique Granados/Granados||\n2|Heitor Villa-Lobos/Villa-Lobos||\n2|Astor Piazzolla/Piazzolla||\n2|Hildegard of Bingen|Hildegarde de Bingen|\n2|Clara Schumann||\n2|Fanny Mendelssohn||\n2|Lili Boulanger||\n4|Ennio Morricone/Morricone||\n3|Joe Hisaishi/Hisaishi||\n3|Howard Shore||\n3|Danny Elfman/Elfman||\n4|Ludovico Einaudi/Einaudi||\n3|Yann Tiersen/Tiersen||\n2|Max Richter||\n2|Arvo Pärt/Arvo Part||\n2|Karl Jenkins||\n3|Michel Legrand/Legrand||\n2|Vladimir Cosma/Cosma||\n3|Koji Kondo||\n0|Elvis Presley||no\n0|Michael Jackson||no\n0|Taylor Swift||no"},"explorers":{"z":1,"d":[],"e":"8|Christopher Columbus/Columbus|Christophe Colomb/Colomb|\n6|Marco Polo||\n6|Neil Armstrong/Armstrong||\n5|Ferdinand Magellan/Magellan|Fernand de Magellan/Magellan|\n5|Vasco da Gama/Da Gama|Vasco de Gama|\n5|James Cook/Captain Cook/Cook||\n5|Yuri Gagarin/Gagarin|Youri Gagarine/Gagarine|\n5|Roald Amundsen/Amundsen||\n4|Ernest Shackleton/Shackleton||\n3|Robert Falcon Scott/Captain Scott||\n4|Edmund Hillary/Hillary||\n3|Tenzing Norgay/Tenzing||\n4|Amerigo Vespucci/Vespucci|Amerigo Vespucci/Améric Vespuce|\n3|Leif Erikson/Leif Eriksson|Leif Erikson|\n3|Erik the Red|Érik le Rouge|\n3|Hernán Cortés/Cortés/Cortez|Hernan Cortés/Cortès|\n3|Francisco Pizarro/Pizarro|François Pizarre/Pizarre|\n4|Jacques Cartier/Cartier||\n3|Samuel de Champlain/Champlain||\n3|Henry Hudson/Hudson||\n2|John Cabot/Cabot|Jean Cabot|\n3|Bartolomeu Dias/Dias|Bartolomeu Dias/Barthélemy Dias|\n3|Ibn Battuta||\n3|Zheng He||\n3|Lewis and Clark/Meriwether Lewis/William Clark||\n3|David Livingstone/Livingstone||\n2|Henry Morton Stanley/Stanley||\n3|Sir Francis Drake/Francis Drake/Drake||\n2|Walter Raleigh/Raleigh||\n3|Abel Tasman/Tasman||\n2|Louis-Antoine de Bougainville/Bougainville||\n3|Jean-François de La Pérouse/La Pérouse/Lapérouse||\n2|Jules Dumont d'Urville/Dumont d'Urville||\n2|René-Robert Cavelier de La Salle/La Salle||\n3|Robert Peary/Peary||\n2|Matthew Henson/Henson||\n2|Fridtjof Nansen/Nansen||\n2|Vitus Bering/Bering||\n2|Juan Ponce de León/Ponce de León||\n2|Vasco Núñez de Balboa/Balboa||\n2|Pedro Álvares Cabral/Cabral||\n2|Hernando de Soto/De Soto||\n2|Francisco de Orellana/Orellana||\n2|Alexander von Humboldt/Humboldt||\n2|Mungo Park||\n2|Richard Francis Burton/Richard Burton||\n2|John Hanning Speke/Speke||\n2|Gertrude Bell||\n2|Isabella Bird||\n2|Freya Stark||\n2|Alexandra David-Néel/David-Néel||\n4|Jacques Cousteau/Cousteau|Jacques-Yves Cousteau|\n3|Thor Heyerdahl/Heyerdahl||\n2|Paul-Émile Victor||\n4|Buzz Aldrin/Aldrin||\n3|Valentina Tereshkova/Tereshkova|Valentina Terechkova|\n2|Sally Ride||\n4|Thomas Pesquet/Pesquet||\n2|Jean-Loup Chrétien||\n4|Amelia Earhart/Earhart||\n3|Charles Lindbergh/Lindbergh||\n3|Louis Blériot/Blériot||\n3|Bertrand Piccard/Piccard||\n2|Auguste Piccard||\n2|Reinhold Messner/Messner||\n3|Bear Grylls||\n2|Hiram Bingham/Bingham||\n3|Howard Carter||\n2|Heinrich Schliemann/Schliemann||\n2|Ranulph Fiennes/Fiennes||\n3|Mike Horn||\n0|Indiana Jones||no\n0|Dora||no"},"emperors":{"z":1,"d":[],"e":"9|Julius Caesar/Caesar|Jules César/César|\n8|Augustus/Octavian|Auguste/Octave|\n7|Nero|Néron|\n6|Caligula||\n5|Marcus Aurelius|Marc Aurèle/Marc-Aurèle|\n5|Constantine/Constantine the Great|Constantin/Constantin Ier|\n5|Hadrian|Hadrien|\n5|Trajan||\n5|Tiberius|Tibère|\n5|Claudius|Claude|\n4|Commodus|Commode|\n3|Vespasian|Vespasien|\n3|Titus||\n3|Domitian|Domitien|\n3|Caracalla||\n3|Diocletian|Dioclétien|\n3|Septimius Severus/Severus|Septime Sévère|\n3|Antoninus Pius|Antonin le Pieux|\n2|Galba||\n2|Otho|Othon|\n2|Vitellius||\n2|Nerva||\n2|Lucius Verus|Lucius Vérus|\n2|Pertinax||\n2|Didius Julianus|Didius Julien|\n2|Geta||\n2|Macrinus|Macrin|\n2|Elagabalus/Heliogabalus|Élagabal/Héliogabale|\n2|Severus Alexander|Sévère Alexandre|\n2|Maximinus Thrax|Maximin le Thrace|\n2|Gordian III/Gordian 3|Gordien III/Gordien 3|\n2|Philip the Arab|Philippe l'Arabe|\n2|Decius|Dèce|\n2|Valerian|Valérien|\n2|Gallienus|Gallien|\n2|Claudius Gothicus|Claude le Gothique|\n2|Aurelian|Aurélien|\n2|Probus||\n2|Carus||\n2|Maximian|Maximien|\n2|Galerius|Galère|\n2|Constantius Chlorus/Constantius I/Constantius 1|Constance Chlore|\n2|Maxentius|Maxence|\n2|Licinius||\n2|Constantius II/Constantius 2|Constance II/Constance 2|\n2|Julian/Julian the Apostate|Julien/Julien l'Apostat|\n2|Jovian|Jovien|\n2|Valentinian I/Valentinian 1|Valentinien Ier|\n2|Valens||\n2|Gratian|Gratien|\n2|Theodosius I/Theodosius 1/Theodosius the Great|Théodose Ier/Théodose|\n2|Honorius||\n2|Arcadius||\n3|Romulus Augustulus|Romulus Augustule|\n3|Justinian|Justinien|\n2|Charlemagne||no\n2|Napoleon|Napoléon|no\n2|Pompey|Pompée|no\n2|Mark Antony|Marc Antoine|no\n2|Cleopatra|Cléopâtre|no\n2|Brutus||no"},"fr_kings":{"z":1,"d":["roi","king"],"e":"5|Louis XIV/Louis 14/Sun King|Louis XIV/Louis 14/Roi-Soleil|\n5|Louis XVI/Louis 16||\n4|Charlemagne||\n4|Clovis/Clovis I/Clovis 1|Clovis/Clovis Ier|\n4|Henri IV/Henri 4/Henry IV/Henry 4||\n4|François I/François 1/Francis I/Francis 1|François Ier/François Premier|\n3|Louis XIII/Louis 13||\n4|Louis XV/Louis 15||\n4|Saint Louis/Louis IX/Louis 9||\n3|Philippe le Bel/Philip IV/Philip 4|Philippe IV le Bel/Philippe le Bel|\n3|Louis XVIII/Louis 18||\n3|Charles X/Charles 10||\n3|Louis-Philippe/Louis Philippe I/Louis Philippe 1|Louis-Philippe Ier|\n3|Hugues Capet/Hugh Capet|Hugues Capet|\n3|Philippe Auguste/Philip II Augustus|Philippe II Auguste/Philippe Auguste|\n2|Charles VII/Charles 7||\n2|Louis XI/Louis 11||\n2|Charles VIII/Charles 8||\n2|Louis XII/Louis 12||\n2|Henri II/Henri 2/Henry II/Henry 2||\n2|François II/François 2/Francis II/Francis 2||\n2|Charles IX/Charles 9||\n2|Henri III/Henri 3/Henry III/Henry 3||\n2|Jean II le Bon/John II/John 2|Jean le Bon|\n2|Charles V le Sage/Charles V/Charles 5|Charles V/Charles 5|\n2|Charles VI/Charles 6||\n2|Philippe VI/Philippe 6||\n2|Louis X/Louis 10||\n2|Philippe V/Philippe 5||\n2|Charles IV le Bel/Charles IV/Charles 4|Charles IV/Charles 4|\n2|Louis VIII/Louis 8||\n2|Louis VII/Louis 7||\n2|Louis VI/Louis 6||\n2|Philippe I/Philippe 1||\n2|Henri I/Henri 1||\n2|Robert II/Robert 2/Robert the Pious|Robert le Pieux|\n2|Louis I/Louis 1/Louis the Pious|Louis le Pieux|\n2|Charles the Bald/Charles II/Charles 2|Charles le Chauve|\n2|Pepin the Short|Pépin le Bref|\n3|Dagobert/Dagobert I/Dagobert 1|Dagobert Ier|\n2|Charles Martel||no\n2|Napoléon I/Napoléon 1/Napoleon|Napoléon Ier/Napoléon|no\n2|Napoléon III/Napoléon 3||no\n2|Louis XVII/Louis 17||\n2|Marie-Antoinette||no"},"mythology":{"z":1,"d":[],"e":"8|Zeus||greek\n7|Poseidon|Poséidon|greek\n7|Hades|Hadès|greek\n7|Athena|Athéna|greek\n7|Hercules/Heracles|Hercule/Héraclès|greek\n7|Aphrodite||greek\n6|Apollo|Apollon|greek\n6|Ares|Arès|greek\n6|Hermes|Hermès|greek\n6|Artemis|Artémis|greek\n6|Hera|Héra|greek\n6|Medusa|Méduse|greek\n6|Achilles|Achille|greek\n5|Dionysus|Dionysos|greek\n5|Hephaestus|Héphaïstos|greek\n5|Demeter|Déméter|greek\n5|Persephone|Perséphone|greek\n5|Kronos/Cronus|Cronos|greek\n5|Gaia|Gaïa|greek\n5|Prometheus|Prométhée|greek\n5|Pegasus|Pégase|greek\n5|Minotaur|Minotaure|greek\n5|Odysseus/Ulysses|Ulysse|greek\n5|Perseus|Persée|greek\n5|Theseus|Thésée|greek\n5|Pandora|Pandore|greek\n5|Cyclops/Polyphemus|Cyclope/Polyphème|greek\n5|Narcissus|Narcisse|greek\n5|Icarus|Icare|greek\n5|Atlas||greek\n5|Eros|Éros|greek\n5|Nike||greek\n5|Hydra|Hydre|greek\n5|Cerberus|Cerbère|greek\n5|Helen of Troy/Helen|Hélène de Troie/Hélène|greek\n5|Jason||greek\n5|Orpheus|Orphée|greek\n5|Hestia||greek\n5|Uranus|Ouranos|greek\n5|Rhea|Rhéa|greek\n4|Pan||greek\n3|Nemesis|Némésis|greek\n3|Hypnos||greek\n2|Thanatos||greek\n3|Morpheus|Morphée|greek\n3|Helios|Hélios|greek\n2|Selene|Séléné|greek\n2|Eos|Éos|greek\n3|Hecate|Hécate|greek\n2|Tyche|Tyché|greek\n3|Nyx||greek\n2|Chaos||greek\n2|Oceanus|Océanos|greek\n2|Tethys|Téthys|greek\n2|Hyperion|Hypérion|greek\n2|Themis|Thémis|greek\n2|Mnemosyne|Mnémosyne|greek\n3|Iris||greek\n2|Hebe|Hébé|greek\n2|Asclepius|Asclépios|greek\n3|Charon||greek\n3|The Muses/Muses|Les Muses/Muses|greek\n2|Calliope||greek\n2|Clio||greek\n3|Echo|Écho|greek\n3|Ajax||greek\n3|Hector||greek\n3|Paris|Pâris|greek\n3|Agamemnon||greek\n2|Menelaus|Ménélas|greek\n2|Priam||greek\n3|Cassandra|Cassandre|greek\n3|Penelope|Pénélope|greek\n2|Telemachus|Télémaque|greek\n3|Oedipus|Œdipe|greek\n2|Antigone||greek\n3|Ariadne|Ariane|greek\n3|Daedalus|Dédale|greek\n3|Midas||greek\n3|Sisyphus|Sisyphe|greek\n2|Tantalus|Tantale|greek\n2|Bellerophon|Bellérophon|greek\n3|Chimera|Chimère|greek\n3|Sphinx||greek\n3|Centaur|Centaure|greek\n2|Satyr|Satyre|greek\n3|Sirens|Sirènes|greek\n2|Scylla||greek\n2|Charybdis|Charybde|greek\n3|Harpy|Harpie|greek\n3|Gorgon|Gorgone|greek\n3|Titans||greek\n2|Typhon||greek\n2|Adonis||greek\n3|Psyche|Psyché|greek\n2|Europa|Europe|greek\n2|Leda|Léda|greek\n2|Danae|Danaé|greek\n2|Io||greek\n2|Ganymede|Ganymède|greek\n2|Castor||greek\n2|Pollux||greek\n2|Atalanta|Atalante|greek\n3|Circe|Circé|greek\n2|Calypso||greek\n3|Medea|Médée|greek\n2|Electra|Électre|greek\n3|Orion||greek\n2|Hyacinth|Hyacinthe|greek\n2|Arachne|Arachné|greek\n2|Phaethon|Phaéton|greek\n5|Jupiter||roman\n5|Mars||roman\n5|Venus|Vénus|roman\n5|Neptune||roman\n5|Mercury|Mercure|roman\n5|Juno|Junon|roman\n5|Minerva|Minerve|roman\n5|Pluto|Pluton|roman\n5|Saturn|Saturne|roman\n5|Cupid|Cupidon|roman\n5|Vulcan|Vulcain|roman\n5|Diana|Diane|roman\n5|Bacchus||roman\n5|Janus||roman\n5|Vesta||roman\n5|Ceres|Cérès|roman\n4|Romulus||roman\n4|Remus/Rémus|Rémus|roman\n3|Aeneas|Énée|roman\n2|Faunus/Faun|Faune|roman\n3|Aurora|Aurore|roman\n2|Fortuna||roman\n2|Proserpina|Proserpine|roman\n2|Sol||roman\n2|Luna||roman\n2|Quirinus||roman\n2|Bellona|Bellone|roman\n2|Flora|Flore|roman\n2|Victoria||roman\n2|Terminus||roman\n6|Thor||norse\n6|Odin||norse\n6|Loki||norse\n5|Freya/Freyja|Freyja|norse\n5|Frigg/Frigga|Frigg|norse\n5|Baldur/Balder|Baldr|norse\n5|Tyr||norse\n5|Heimdall||norse\n5|Valkyries/Valkyrie|Valkyries/Walkyrie|norse\n5|Fenrir||norse\n5|Jörmungandr/Midgard Serpent|Jörmungand/Serpent de Midgard|norse\n5|Hel||norse\n5|Freyr/Frey||norse\n5|Njord/Njörðr||norse\n5|Idun/Iðunn|Idunn|norse\n5|Bragi||norse\n5|Sif||norse\n5|Vidar||norse\n5|Vali||norse\n5|Ymir||norse\n5|Sleipnir||norse\n5|Yggdrasil||norse\n5|Mjölnir/Mjolnir||norse\n5|Ragnarök/Ragnarok||norse\n5|Valhalla|Valhalla/Walhalla|norse\n5|Asgard||norse\n5|Surtr||norse\n5|Huginn and Muninn/Huginn/Muninn||norse\n6|Ra/Re|Râ/Rê|egypt\n5|Osiris||egypt\n5|Isis||egypt\n5|Anubis||egypt\n5|Horus||egypt\n5|Set/Seth|Seth|egypt\n5|Thoth||egypt\n5|Bastet||egypt\n5|Hathor||egypt\n5|Amun/Amon/Amun-Ra|Amon/Amon-Rê|egypt\n5|Ptah||egypt\n5|Sekhmet||egypt\n5|Sobek||egypt\n5|Nut||egypt\n5|Geb||egypt\n5|Shu||egypt\n5|Tefnut||egypt\n5|Maat||egypt\n5|Nephthys||egypt\n5|Khnum||egypt\n5|Aten/Aton|Aton|egypt\n5|Bes||egypt\n5|Taweret|Thouéris|egypt\n5|Apophis/Apep||egypt\n5|Khepri||egypt\n5|Hapi||egypt\n0|Jesus|Jésus|no\n0|God|Dieu|no\n0|Buddha|Bouddha|no\n0|Superman||no"},"constellations":{"z":1,"d":["constellation"],"e":"9|Orion||\n8|Ursa Major/Great Bear/Big Dipper/Plough|Grande Ourse|\n6|Ursa Minor/Little Bear/Little Dipper|Petite Ourse|\n6|Cassiopeia|Cassiopée|\n6|Andromeda|Andromède|\n7|Leo|Lion|zod\n7|Scorpius/Scorpio|Scorpion|zod\n7|Gemini|Gémeaux|zod\n7|Taurus|Taureau|zod\n6|Aries|Bélier|zod\n6|Cancer||zod\n6|Virgo|Vierge|zod\n6|Libra|Balance|zod\n6|Sagittarius|Sagittaire|zod\n6|Capricornus/Capricorn|Capricorne|zod\n6|Aquarius|Verseau|zod\n6|Pisces|Poissons|zod\n5|Crux/Southern Cross|Croix du Sud|\n5|Pegasus|Pégase|\n5|Draco/Dragon|Dragon|\n5|Cygnus/Swan|Cygne|\n5|Perseus|Persée|\n5|Hercules|Hercule|\n5|Canis Major/Great Dog|Grand Chien|\n4|Canis Minor/Little Dog|Petit Chien|\n4|Lyra|Lyre|\n4|Aquila/Eagle|Aigle|\n4|Centaurus/Centaur|Centaure|\n4|Phoenix|Phénix|\n4|Hydra|Hydre|\n4|Ophiuchus|Ophiuchus/Serpentaire|\n4|Boötes/Bootes|Bouvier|\n4|Auriga|Cocher|\n4|Cepheus|Céphée|\n3|Lupus/Wolf|Loup|\n3|Lynx||\n3|Monoceros/Unicorn|Licorne|\n3|Delphinus/Dolphin|Dauphin|\n3|Corona Borealis/Northern Crown|Couronne boréale|\n3|Corona Australis/Southern Crown|Couronne australe|\n3|Eridanus|Éridan|\n3|Cetus/Whale|Baleine|\n3|Lepus/Hare|Lièvre|\n3|Corvus/Crow|Corbeau|\n3|Serpens/Serpent|Serpent|\n3|Sagitta/Arrow|Flèche|\n3|Columba/Dove|Colombe|\n3|Pavo/Peacock|Paon|\n3|Tucana/Toucan|Toucan|\n3|Carina|Carène|\n3|Vela|Voiles|\n3|Puppis|Poupe|\n2|Antlia|Machine pneumatique|\n2|Apus|Oiseau de paradis|\n2|Ara|Autel|\n2|Caelum|Burin|\n2|Camelopardalis|Girafe|\n2|Canes Venatici|Chiens de chasse|\n2|Chamaeleon|Caméléon|\n2|Circinus|Compas|\n2|Coma Berenices|Chevelure de Bérénice|\n2|Crater|Coupe|\n2|Dorado|Dorade|\n2|Equuleus|Petit Cheval|\n2|Fornax|Fourneau|\n2|Grus|Grue|\n2|Horologium|Horloge|\n2|Hydrus|Hydre mâle|\n2|Indus|Indien|\n2|Lacerta|Lézard|\n2|Leo Minor|Petit Lion|\n2|Mensa|Table|\n2|Microscopium|Microscope|\n2|Musca|Mouche|\n2|Norma|Règle|\n2|Octans|Octant|\n2|Pictor|Peintre|\n2|Piscis Austrinus|Poisson austral|\n2|Pyxis|Boussole|\n2|Reticulum|Réticule|\n2|Sculptor|Sculpteur|\n2|Scutum|Écu de Sobieski|\n2|Sextans|Sextant|\n2|Telescopium|Télescope|\n2|Triangulum|Triangle|\n2|Triangulum Australe|Triangle austral|\n2|Volans|Poisson volant|\n2|Vulpecula|Petit Renard|\n0|Pleiades|Pléiades|no\n0|Milky Way|Voie lactée|no\n0|Sun|Soleil|no"},"stars":{"z":1,"d":["star","etoile"],"e":"9|Sirius||\n8|Polaris/North Star/Pole Star|Étoile polaire/Polaris|\n7|Betelgeuse|Bételgeuse|\n6|Rigel||\n6|Vega|Véga|\n6|Alpha Centauri/Rigil Kentaurus|Alpha du Centaure/Alpha Centauri|\n6|Proxima Centauri/Proxima|Proxima du Centaure/Proxima Centauri|\n5|Antares|Antarès|\n5|Aldebaran|Aldébaran|\n5|Arcturus||\n5|Capella||\n5|Procyon||\n5|Altair||\n5|Deneb||\n5|Spica|Épi/Spica|\n5|Pollux||\n5|Castor||\n5|Regulus|Régulus|\n5|Canopus||\n4|Fomalhaut||\n4|Achernar||\n4|Bellatrix||\n4|Mintaka||\n4|Alnitak||\n4|Alnilam||\n4|Algol||\n4|Mira||\n4|Mizar||\n4|Alcor||\n4|Barnard's Star|Étoile de Barnard|\n4|Tau Ceti||\n4|Sirius B||\n4|VY Canis Majoris||\n4|UY Scuti||\n4|Eta Carinae|Êta Carinae|\n3|Saiph||\n3|Dubhe||\n3|Merak||\n3|Alioth||\n3|Alkaid||\n3|Thuban||\n3|Epsilon Eridani||\n3|Wolf 359||\n3|Shaula||\n3|Hadar||\n3|Mimosa||\n3|Acrux||\n3|Gacrux||\n3|Alhena||\n3|Elnath||\n3|Hamal||\n3|Kochab||\n3|Schedar||\n3|Caph||\n3|Mirach||\n3|Almach||\n3|Alpheratz||\n3|Markab||\n3|Enif||\n3|Sadr||\n3|Albireo||\n3|Rasalhague||\n3|Nunki||\n3|Kaus Australis||\n3|Atria||\n3|Avior||\n3|Miaplacidus||\n3|Suhail||\n3|Wezen||\n3|Adhara||\n3|Mirzam||\n3|Alphard||\n3|Denebola||\n3|Zosma||\n3|Algieba||\n3|Cor Caroli||\n3|Vindemiatrix||\n3|Izar||\n3|Alphecca||\n3|Eltanin||\n3|Rastaban||\n3|Menkar||\n3|Diphda||\n3|Ankaa||\n3|Pistol Star|Étoile du Pistolet|\n3|Rho Cassiopeiae||\n3|Luyten's Star|Étoile de Luyten|\n3|Ross 128||\n3|Gliese 581||\n3|TRAPPIST-1||\n3|Kepler-452||\n3|Tabby's Star/Boyajian's Star|Étoile de Tabby|\n0|Sun|Soleil|no\n0|Moon|Lune|no\n0|Venus/Morning Star/Evening Star|Vénus/Étoile du berger|no\n0|Mars||no\n0|Jupiter||no\n0|Pleiades|Pléiades|no\n0|Orion||no"},"moons":{"z":2,"d":[],"e":"9|Moon/The Moon/Luna|Lune/La Lune/Luna|earth\n6|Phobos||mars\n6|Deimos||mars\n8|Europa|Europe|jup\n7|Io||jup\n8|Ganymede|Ganymède|jup\n7|Callisto||jup\n4|Amalthea|Amalthée|jup\n3|Himalia||jup\n3|Thebe|Thébé|jup\n3|Metis|Métis|jup\n3|Adrastea|Adrastée|jup\n2|Elara||jup\n2|Pasiphae|Pasiphaé|jup\n2|Sinope||jup\n2|Lysithea||jup\n2|Carme||jup\n2|Ananke||jup\n2|Leda|Léda|jup\n1|Callirrhoe||jup\n1|Themisto||jup\n1|Megaclite||jup\n1|Taygete||jup\n1|Chaldene||jup\n1|Harpalyke||jup\n1|Kalyke||jup\n1|Iocaste||jup\n1|Erinome||jup\n1|Isonoe||jup\n1|Praxidike||jup\n1|Autonoe||jup\n1|Thyone||jup\n1|Hermippe||jup\n1|Aitne||jup\n1|Eurydome||jup\n1|Euanthe||jup\n1|Euporie||jup\n1|Orthosie||jup\n1|Sponde||jup\n1|Kale||jup\n1|Pasithee||jup\n1|Hegemone||jup\n1|Mneme||jup\n1|Aoede||jup\n1|Thelxinoe||jup\n1|Arche||jup\n1|Kallichore||jup\n1|Helike||jup\n1|Carpo||jup\n1|Eukelade||jup\n1|Cyllene||jup\n1|Kore||jup\n1|Herse||jup\n1|Dia||jup\n1|Eupheme||jup\n1|Valetudo||jup\n1|Pandia||jup\n1|Ersa||jup\n1|Philophrosyne||jup\n9|Titan||sat\n6|Enceladus|Encelade|sat\n5|Mimas||sat\n5|Rhea|Rhéa|sat\n5|Iapetus|Japet|sat\n5|Dione|Dioné|sat\n5|Tethys|Téthys|sat\n4|Hyperion|Hypérion|sat\n4|Phoebe|Phœbé|sat\n3|Janus||sat\n3|Epimetheus|Épiméthée|sat\n3|Pandora|Pandore|sat\n3|Prometheus|Prométhée|sat\n3|Atlas||sat\n3|Pan||sat\n2|Helene|Hélène|sat\n2|Telesto|Télesto|sat\n2|Calypso||sat\n2|Daphnis||sat\n2|Methone|Méthone|sat\n2|Pallene|Pallène|sat\n2|Polydeuces|Pollux|sat\n2|Anthe||sat\n2|Aegaeon||sat\n1|Ymir||sat\n1|Paaliaq||sat\n1|Tarvos||sat\n1|Ijiraq||sat\n1|Suttungr||sat\n1|Kiviuq||sat\n1|Mundilfari||sat\n1|Albiorix||sat\n1|Skathi||sat\n1|Erriapus||sat\n1|Siarnaq||sat\n1|Thrymr||sat\n1|Narvi||sat\n1|Aegir||sat\n1|Bebhionn||sat\n1|Bergelmir||sat\n1|Bestla||sat\n1|Farbauti||sat\n1|Fenrir||sat\n1|Fornjot||sat\n1|Hati||sat\n1|Hyrrokkin||sat\n1|Kari||sat\n1|Loge||sat\n1|Skoll||sat\n1|Surtur||sat\n1|Jarnsaxa||sat\n1|Greip||sat\n1|Tarqeq||sat\n1|Gridr||sat\n1|Angrboda||sat\n1|Skrymir||sat\n1|Gerd||sat\n1|Eggther||sat\n1|Beli||sat\n1|Gunnlod||sat\n1|Thiazzi||sat\n1|Alvaldi||sat\n1|Geirrod||sat\n6|Miranda||ura\n5|Titania||ura\n5|Oberon|Obéron|ura\n4|Ariel||ura\n4|Umbriel||ura\n3|Puck||ura\n2|Cordelia|Cordélia|ura\n2|Ophelia|Ophélie|ura\n2|Bianca||ura\n2|Cressida||ura\n2|Desdemona|Desdémone|ura\n2|Juliet|Juliette|ura\n2|Portia||ura\n2|Rosalind|Rosalinde|ura\n2|Belinda||ura\n2|Perdita||ura\n2|Mab||ura\n2|Cupid|Cupidon|ura\n2|Caliban||ura\n2|Sycorax||ura\n1|Prospero||ura\n1|Setebos||ura\n1|Stephano||ura\n1|Trinculo||ura\n1|Francisco||ura\n1|Margaret||ura\n1|Ferdinand||ura\n7|Triton||nep\n4|Nereid|Néréide|nep\n3|Proteus|Protée|nep\n2|Larissa||nep\n2|Naiad|Naïade|nep\n2|Thalassa||nep\n2|Despina||nep\n2|Galatea|Galatée|nep\n2|Halimede||nep\n2|Psamathe||nep\n2|Sao||nep\n2|Laomedeia||nep\n2|Neso||nep\n2|Hippocamp||nep\n6|Charon||dwarf\n3|Nix||dwarf\n3|Hydra||dwarf\n2|Kerberos||dwarf\n2|Styx||dwarf\n2|Dysnomia||dwarf\n2|Hi'iaka||dwarf\n2|Namaka||dwarf\n2|Weywot||dwarf\n2|Vanth||dwarf\n2|Actaea||dwarf\n2|Ilmarë/Ilmare||dwarf\n2|MK2||dwarf\n0|Pluto|Pluton|no\n0|Mars||no\n0|Jupiter||no\n0|Saturn|Saturne|no\n0|Venus|Vénus|no\n0|Mercury|Mercure|no\n0|Uranus||no\n0|Neptune||no\n0|Earth|Terre|no\n0|Ceres|Cérès|no\n0|Sun|Soleil|no\n0|Halley's Comet|Comète de Halley|no"},"elements":{"z":1,"d":[],"e":"5|Hydrogen/H|Hydrogène|gas nm\n5|Helium/He|Hélium|gas noble\n4|Lithium/Li|Lithium|metal\n3|Beryllium/Be|Béryllium|metal\n3|Boron/B|Bore|nm\n6|Carbon/C|Carbone|nm\n5|Nitrogen/N|Azote|gas nm\n7|Oxygen/O|Oxygène|gas nm\n4|Fluorine/F|Fluor|gas hal\n4|Neon/Ne|Néon|gas noble\n5|Sodium/Na|Sodium|metal\n4|Magnesium/Mg|Magnésium|metal\n5|Aluminium/Aluminum/Al|Aluminium|metal\n4|Silicon/Si|Silicium|nm\n3|Phosphorus/P|Phosphore|nm\n4|Sulfur/Sulphur/S|Soufre|nm\n4|Chlorine/Cl|Chlore|gas hal\n3|Argon/Ar|Argon|gas noble\n4|Potassium/K|Potassium|metal\n5|Calcium/Ca|Calcium|metal\n2|Scandium/Sc|Scandium|metal\n4|Titanium/Ti|Titane|metal\n2|Vanadium/V|Vanadium|metal\n3|Chromium/Cr|Chrome|metal\n2|Manganese/Mn|Manganèse|metal\n7|Iron/Fe|Fer|metal\n3|Cobalt/Co|Cobalt|metal\n4|Nickel/Ni|Nickel|metal\n6|Copper/Cu|Cuivre|metal\n4|Zinc/Zn|Zinc|metal\n2|Gallium/Ga|Gallium|metal\n2|Germanium/Ge|Germanium|nm\n3|Arsenic/As|Arsenic|nm\n2|Selenium/Se|Sélénium|nm\n3|Bromine/Br|Brome|hal\n3|Krypton/Kr|Krypton|gas noble\n2|Rubidium/Rb|Rubidium|metal\n2|Strontium/Sr|Strontium|metal\n2|Yttrium/Y|Yttrium|metal\n2|Zirconium/Zr|Zirconium|metal\n2|Niobium/Nb|Niobium|metal\n2|Molybdenum/Mo|Molybdène|metal\n2|Technetium/Tc|Technétium|metal\n2|Ruthenium/Ru|Ruthénium|metal\n2|Rhodium/Rh|Rhodium|metal\n2|Palladium/Pd|Palladium|metal\n7|Silver/Ag|Argent|metal\n2|Cadmium/Cd|Cadmium|metal\n2|Indium/In|Indium|metal\n4|Tin/Sn|Étain|metal\n2|Antimony/Sb|Antimoine|nm\n2|Tellurium/Te|Tellure|nm\n3|Iodine/I|Iode|hal\n3|Xenon/Xe|Xénon|gas noble\n2|Caesium/Cesium/Cs|Césium|metal\n2|Barium/Ba|Baryum|metal\n2|Lanthanum/La|Lanthane|metal\n2|Cerium/Ce|Cérium|metal\n1|Praseodymium/Pr|Praséodyme|metal\n2|Neodymium/Nd|Néodyme|metal\n1|Promethium/Pm|Prométhium|metal\n1|Samarium/Sm|Samarium|metal\n1|Europium/Eu|Europium|metal\n1|Gadolinium/Gd|Gadolinium|metal\n1|Terbium/Tb|Terbium|metal\n1|Dysprosium/Dy|Dysprosium|metal\n1|Holmium/Ho|Holmium|metal\n1|Erbium/Er|Erbium|metal\n1|Thulium/Tm|Thulium|metal\n1|Ytterbium/Yb|Ytterbium|metal\n1|Lutetium/Lu|Lutécium/Lutétium|metal\n1|Hafnium/Hf|Hafnium|metal\n2|Tantalum/Ta|Tantale|metal\n3|Tungsten/Wolfram/W|Tungstène|metal\n1|Rhenium/Re|Rhénium|metal\n2|Osmium/Os|Osmium|metal\n2|Iridium/Ir|Iridium|metal\n5|Platinum/Pt|Platine|metal\n9|Gold/Au|Or|metal\n5|Mercury/Hg|Mercure|metal\n2|Thallium/Tl|Thallium|metal\n5|Lead/Pb|Plomb|metal\n2|Bismuth/Bi|Bismuth|metal\n3|Polonium/Po|Polonium|metal\n1|Astatine/At|Astate|hal\n3|Radon/Rn|Radon|gas noble\n2|Francium/Fr|Francium|metal\n3|Radium/Ra|Radium|metal\n1|Actinium/Ac|Actinium|metal\n2|Thorium/Th|Thorium|metal\n1|Protactinium/Pa|Protactinium|metal\n6|Uranium/U|Uranium|metal\n2|Neptunium/Np|Neptunium|metal\n4|Plutonium/Pu|Plutonium|metal\n1|Americium/Am|Américium|metal\n1|Curium/Cm|Curium|metal\n1|Berkelium/Bk|Berkélium|metal\n2|Californium/Cf|Californium|metal\n1|Einsteinium/Es|Einsteinium|metal\n1|Fermium/Fm|Fermium|metal\n1|Mendelevium/Md|Mendélévium|metal\n1|Nobelium/No|Nobélium|metal\n1|Lawrencium/Lr|Lawrencium|metal\n1|Rutherfordium/Rf|Rutherfordium|metal\n1|Dubnium/Db|Dubnium|metal\n1|Seaborgium/Sg|Seaborgium|metal\n1|Bohrium/Bh|Bohrium|metal\n1|Hassium/Hs|Hassium|metal\n1|Meitnerium/Mt|Meitnérium|metal\n1|Darmstadtium/Ds|Darmstadtium|metal\n1|Roentgenium/Rg|Roentgenium|metal\n1|Copernicium/Cn|Copernicium|metal\n1|Nihonium/Nh|Nihonium|metal\n1|Flerovium/Fl|Flérovium|metal\n1|Moscovium/Mc|Moscovium|metal\n1|Livermorium/Lv|Livermorium|metal\n1|Tennessine/Ts|Tennesse|hal\n1|Oganesson/Og|Oganesson|noble\n0|Water|Eau|no\n0|Steel|Acier|no\n0|Bronze||no\n0|Brass|Laiton|no\n0|Diamond|Diamant|no\n0|Air||no\n0|Fire|Feu|no\n0|Earth|Terre|no\n0|Salt|Sel|no\n0|Plastic|Plastique|no\n0|Kryptonite||no\n0|Vibranium||no\n0|Adamantium||no\n0|Mithril||no"},"body":{"z":1,"d":[],"e":"9|Heart|Cœur/Coeur|org\n9|Brain|Cerveau|org\n8|Hand|Main|\n8|Head|Tête|\n8|Eye/Eyes|Œil/Yeux/Oeil|\n8|Foot/Feet|Pied|\n8|Arm|Bras|\n8|Leg|Jambe|\n7|Nose|Nez|\n7|Ear|Oreille|\n7|Mouth|Bouche|\n7|Finger|Doigt|\n7|Lungs/Lung|Poumon|org\n7|Liver|Foie|org\n7|Stomach|Estomac|org\n6|Kidney|Rein|org\n6|Skin|Peau|org\n6|Toe|Orteil|\n6|Knee|Genou|\n6|Elbow|Coude|\n6|Shoulder|Épaule|\n6|Neck|Cou|\n6|Back|Dos|\n6|Teeth/Tooth|Dent|\n6|Tongue|Langue|org\n6|Hair|Cheveux/Cheveu/Poils|\n5|Belly/Tummy|Ventre|\n5|Lips/Lip|Lèvre|\n5|Chin|Menton|\n5|Cheek|Joue|\n5|Forehead|Front|\n5|Eyebrow|Sourcil|\n5|Eyelash|Cil|\n5|Eyelid|Paupière|\n5|Thumb|Pouce|\n5|Wrist|Poignet|\n5|Ankle|Cheville|\n5|Heel|Talon|\n5|Hip|Hanche|\n5|Waist|Taille|\n5|Chest|Poitrine/Torse|\n5|Bottom/Buttocks/Bum/Butt|Fesses|\n5|Thigh|Cuisse|\n4|Calf|Mollet|\n3|Shin||\n5|Nail/Fingernail|Ongle|\n4|Palm|Paume|\n4|Belly button/Navel|Nombril|\n5|Jaw|Mâchoire|\n5|Throat|Gorge|\n6|Skull|Crâne|bone\n6|Spine/Backbone|Colonne vertébrale|bone\n5|Ribs/Rib|Côte|bone\n6|Muscle||\n5|Blood|Sang|\n4|Vein|Veine|\n4|Artery|Artère|\n4|Nerve|Nerf|\n4|Bladder|Vessie|org\n5|Intestines/Intestine/Gut/Bowel|Intestin|org\n3|Small intestine|Intestin grêle|org\n3|Large intestine/Colon|Gros intestin/Côlon|org\n4|Pancreas|Pancréas|org\n4|Spleen|Rate|org\n3|Gallbladder|Vésicule biliaire|org\n4|Appendix|Appendice|org\n3|Thyroid|Thyroïde|org\n3|Tonsils|Amygdales|org\n3|Uvula|Luette|\n3|Larynx||org\n3|Pharynx||org\n3|Trachea/Windpipe|Trachée|org\n3|Oesophagus/Esophagus/Gullet|Œsophage|org\n3|Diaphragm|Diaphragme|\n3|Gums/Gum|Gencive|\n3|Nostril|Narine|\n3|Earlobe|Lobe de l'oreille|\n3|Eardrum|Tympan|\n3|Pupil|Pupille|\n3|Iris||\n3|Retina|Rétine|\n3|Cornea|Cornée|\n3|Temple|Tempe|\n4|Armpit|Aisselle|\n4|Forearm|Avant-bras|\n3|Knuckle||\n3|Sole|Plante du pied|\n3|Abdomen||\n3|Pelvis|Bassin|bone\n3|Nape|Nuque|\n4|Collarbone/Clavicle|Clavicule|bone\n3|Shoulder blade/Scapula|Omoplate|bone\n4|Kneecap/Patella|Rotule|bone\n5|Femur/Thighbone|Fémur|bone\n3|Humerus|Humérus|bone\n3|Radius||bone\n3|Ulna|Cubitus/Ulna|bone\n4|Tibia/Shinbone|Tibia|bone\n3|Fibula|Péroné/Fibula|bone\n3|Sternum/Breastbone|Sternum|bone\n3|Vertebra/Vertebrae|Vertèbre|bone\n3|Coccyx/Tailbone|Coccyx|bone\n2|Sacrum||bone\n3|Mandible/Jawbone|Mandibule|bone\n2|Maxilla|Maxillaire|bone\n3|Phalanges/Phalanx|Phalange|bone\n2|Metacarpals/Metacarpal|Métacarpe/Métacarpien|bone\n2|Carpals/Carpal|Carpe|bone\n2|Tarsals/Tarsal|Tarse|bone\n2|Metatarsals/Metatarsal|Métatarse/Métatarsien|bone\n3|Stapes/Stirrup|Étrier|bone\n2|Incus/Anvil|Enclume|bone\n2|Malleus/Hammer|Marteau|bone\n2|Hyoid|Os hyoïde|bone\n2|Ilium|Ilion/Ilium|bone\n2|Ischium|Ischion|bone\n2|Pubis||bone\n2|Calcaneus/Heel bone|Calcanéum|bone\n2|Talus|Astragale/Talus|bone\n2|Cuboid|Cuboïde|bone\n2|Navicular|Naviculaire|bone\n2|Scaphoid|Scaphoïde|bone\n2|Lunate|Semi-lunaire/Lunatum|bone\n2|Trapezium|Trapèze|bone\n2|Hamate|Hamatum/Os crochu|bone\n2|Pisiform|Pisiforme|bone\n2|Capitate|Capitatum/Grand os|bone\n2|Trapezoid|Trapézoïde|bone\n2|Cuneiform|Cunéiforme|bone\n2|Zygomatic/Cheekbone|Zygomatique/Pommette|bone\n2|Frontal bone|Os frontal|bone\n2|Parietal bone|Os pariétal|bone\n2|Temporal bone|Os temporal|bone\n2|Occipital bone|Os occipital|bone\n2|Sphenoid|Sphénoïde|bone\n2|Ethmoid|Ethmoïde|bone\n2|Nasal bone|Os nasal|bone\n2|Vomer||bone\n2|Lacrimal bone|Os lacrymal|bone\n2|Palatine bone|Os palatin|bone\n2|Atlas||bone\n2|Axis||bone\n4|Biceps||\n3|Triceps||\n3|Abs/Abdominals|Abdominaux|\n3|Pecs/Pectorals|Pectoraux|\n3|Quadriceps/Quads|Quadriceps|\n3|Hamstring|Ischio-jambiers|\n3|Glutes/Gluteus|Fessiers|\n2|Deltoid|Deltoïde|\n2|Trapezius||\n3|Achilles tendon|Tendon d'Achille|\n3|Cartilage||\n3|Ligament||\n3|Tendon||\n2|Bone marrow|Moelle osseuse|\n3|Spinal cord|Moelle épinière|\n2|Cerebellum|Cervelet|org\n2|Hippocampus|Hippocampe|\n2|Hypothalamus||\n2|Pituitary gland|Hypophyse|org\n2|Adrenal glands/Adrenal gland|Glandes surrénales/Surrénales|org\n3|Molar|Molaire|\n3|Incisor|Incisive|\n3|Canine||\n3|Wisdom tooth|Dent de sagesse|\n0|Soul|Âme|no\n0|Bone|Os|no\n0|Body|Corps|no\n0|Tail|Queue|no\n0|Wing|Aile|no\n0|Paw|Patte|no"},"gems":{"z":1,"d":["stone","pierre"],"e":"8|Diamond|Diamant|gem\n7|Ruby|Rubis|gem\n7|Emerald|Émeraude|gem\n7|Sapphire|Saphir|gem\n6|Amethyst|Améthyste|gem\n5|Topaz|Topaze|gem\n5|Opal|Opale|gem\n5|Pearl|Perle|gem\n5|Jade||gem\n5|Garnet|Grenat|gem\n5|Aquamarine|Aigue-marine|gem\n5|Turquoise||gem\n5|Quartz||min\n4|Onyx||gem\n4|Rose quartz|Quartz rose|gem\n4|Citrine||gem\n4|Peridot|Péridot|gem\n4|Tourmaline||gem\n4|Lapis lazuli|Lapis-lazuli/Lazurite|gem\n4|Moonstone|Pierre de lune|gem\n5|Obsidian|Obsidienne|rock\n5|Amber|Ambre|gem\n3|Jasper|Jaspe|gem\n4|Agate||gem\n3|Malachite||gem\n3|Tanzanite||gem\n3|Tiger's eye/Tigers eye|Œil-de-tigre|gem\n3|Zircon||gem\n2|Spinel|Spinelle|gem\n2|Alexandrite||gem\n3|Beryl|Béryl|gem\n2|Carnelian|Cornaline|gem\n5|Granite|Granit/Granite|rock\n5|Marble|Marbre|rock\n4|Basalt|Basalte|rock\n4|Limestone|Calcaire|rock\n4|Sandstone|Grès|rock\n4|Slate|Ardoise|rock\n4|Flint|Silex|rock\n4|Chalk|Craie|rock\n3|Pumice|Pierre ponce|rock\n3|Coal|Charbon|rock\n3|Halite/Rock salt|Halite/Sel gemme|min\n3|Pyrite/Fool's gold|Pyrite/Or des fous|min\n3|Hematite|Hématite|min\n3|Fluorite|Fluorine/Fluorite|min\n3|Calcite||min\n3|Mica||min\n3|Feldspar|Feldspath|min\n3|Gypsum|Gypse|min\n3|Talc||min\n3|Graphite||min\n2|Bauxite||min\n2|Magnetite|Magnétite|min\n2|Galena|Galène|min\n2|Cinnabar|Cinabre|min\n2|Azurite||min\n2|Rhodochrosite||gem\n2|Labradorite||gem\n2|Moissanite||gem\n2|Kunzite||gem\n2|Morganite||gem\n2|Chrysoberyl|Chrysobéryl|gem\n2|Iolite|Iolite/Cordiérite|gem\n2|Sunstone|Pierre de soleil|gem\n2|Bloodstone|Héliotrope|gem\n2|Jet|Jais/Jayet|gem\n2|Serpentine||min\n2|Soapstone|Stéatite|rock\n2|Kyanite|Cyanite/Disthène|min\n2|Gneiss||rock\n2|Schist|Schiste|rock\n2|Shale|Schiste argileux|rock\n2|Quartzite||rock\n2|Gabbro||rock\n2|Andesite|Andésite|rock\n2|Tuff|Tuf|rock\n2|Dolomite|Dolomie/Dolomite|rock\n2|Travertine|Travertin|rock\n2|Mother of pearl/Nacre|Nacre|gem\n2|Coral|Corail|gem\n2|Chalcedony|Calcédoine|gem\n2|Chrysocolla|Chrysocolle|min\n2|Sodalite||min\n2|Selenite|Sélénite|min\n2|Celestine|Célestine|min\n2|Apatite||min\n2|Corundum|Corindon|min\n0|Gold|Or|no\n0|Silver|Argent|no\n0|Iron|Fer|no\n0|Kryptonite||no\n0|Crystal|Cristal|no\n0|Glass|Verre|no\n0|Rock|Roche/Rocher|no"},"colours":{"z":1,"d":[],"e":"9|Red|Rouge|\n9|Blue|Bleu|\n8|Green|Vert|\n8|Yellow|Jaune|\n7|Purple/Violet|Violet/Pourpre|\n7|Orange||\n7|Pink|Rose|\n7|Black|Noir|\n6|White|Blanc|\n6|Brown|Marron/Brun|\n5|Grey/Gray|Gris|\n5|Turquoise||\n5|Gold|Doré/Or|\n5|Silver|Argenté/Argent|\n5|Beige||\n4|Magenta||\n4|Cyan||\n4|Navy/Navy blue|Bleu marine/Marine|\n4|Maroon|Bordeaux|\n4|Lilac|Lilas|\n4|Lavender|Lavande|\n4|Indigo||\n3|Crimson|Cramoisi|\n3|Scarlet|Écarlate|\n3|Burgundy||\n3|Teal|Bleu canard/Sarcelle|\n3|Aqua/Aquamarine|Aigue-marine|\n4|Sky blue|Bleu ciel|\n2|Royal blue|Bleu roi|\n3|Lime/Lime green|Vert citron|\n3|Olive|Olive/Vert olive|\n3|Khaki|Kaki|\n3|Mint/Mint green|Vert menthe|\n3|Emerald|Émeraude|\n2|Jade||\n3|Coral|Corail|\n3|Salmon|Saumon|\n3|Peach|Pêche|\n2|Apricot|Abricot|\n2|Mustard|Moutarde|\n2|Lemon|Jaune citron|\n3|Cream|Crème|\n3|Ivory|Ivoire|\n2|Off-white|Blanc cassé|\n3|Bronze||\n2|Copper|Cuivré|\n2|Rust|Rouille|\n2|Ochre/Ocher|Ocre|\n2|Sepia|Sépia|\n2|Chocolate|Chocolat|\n2|Caramel||\n2|Tan|Fauve|\n2|Taupe||\n3|Fuchsia||\n2|Hot pink|Rose vif|\n2|Ruby|Rubis|\n2|Cherry|Cerise|\n2|Raspberry|Framboise|\n2|Plum|Prune|\n3|Mauve||\n2|Charcoal|Anthracite|\n2|Slate|Ardoise|\n3|Azure|Azur|\n2|Cobalt|Bleu cobalt|\n2|Sapphire|Saphir|\n2|Cerulean|Céruléen|\n2|Ultramarine|Outremer|\n2|Periwinkle|Pervenche|\n2|Chartreuse||\n3|Amber|Ambre|\n2|Vermilion|Vermillon|\n2|Carmine|Carmin|\n2|Neon/Neon green|Vert fluo|\n2|Fluorescent yellow|Jaune fluo|\n2|Champagne||\n2|Platinum|Platine|\n2|Pearl|Nacré/Perle|\n2|Sand|Sable|\n2|Mahogany|Acajou|\n2|Chestnut|Châtaigne|\n2|Hazel|Noisette|\n2|Auburn||\n2|Blond/Blonde|Blond|\n2|Ginger|Roux|\n2|Wine/Wine red|Lie-de-vin|\n2|Cardinal red|Rouge cardinal|\n2|Brick red|Rouge brique|\n2|Forest green|Vert forêt|\n2|Bottle green|Vert bouteille|\n2|Sea green|Vert d'eau|\n2|Pistachio|Pistache|\n2|Apple green|Vert pomme|\n2|Sage green|Vert sauge|\n2|Electric blue|Bleu électrique|\n2|Midnight blue|Bleu nuit|\n2|Prussian blue|Bleu de Prusse|\n2|Klein blue/International Klein Blue|Bleu Klein|\n2|Baby blue|Bleu layette|\n2|Baby pink|Rose layette|\n2|Rose gold|Or rose|\n2|Eggshell|Coquille d'œuf|\n2|Rainbow|Arc-en-ciel|no\n2|Transparent/Clear|Transparent|no\n0|Light|Clair|no\n0|Dark|Foncé|no"},"vehicles":{"z":1,"d":[],"e":"9|Car|Voiture/Auto|land\n8|Bus|Bus/Autobus|land\n8|Train||land\n8|Plane/Aeroplane/Airplane|Avion|air\n8|Bicycle/Bike|Vélo/Bicyclette|land\n8|Boat|Bateau|sea\n7|Motorbike/Motorcycle|Moto/Motocyclette|land\n7|Truck/Lorry|Camion|land\n7|Helicopter|Hélicoptère|air\n7|Ship|Navire|sea\n6|Taxi||land\n6|Tram/Tramway/Streetcar|Tram/Tramway|land\n6|Metro/Subway/Underground/Tube|Métro|land\n6|Scooter||land\n6|Rocket|Fusée|air\n6|Submarine|Sous-marin|sea\n6|Van|Camionnette/Fourgon|land\n6|Tractor|Tracteur|land\n6|Ambulance||land\n6|Fire engine/Fire truck|Camion de pompiers|land\n6|Police car|Voiture de police|land\n6|Hot air balloon/Balloon|Montgolfière|air\n5|Skateboard|Skateboard/Planche à roulettes|land\n5|Kick scooter/Push scooter|Trottinette|land\n4|Electric scooter/E-scooter|Trottinette électrique|land\n4|Yacht||sea\n4|Sailboat/Sailing boat|Voilier|sea\n4|Canoe|Canoë|sea\n4|Kayak||sea\n4|Ferry|Ferry/Traversier|sea\n4|Cruise ship|Bateau de croisière/Paquebot|sea\n3|Speedboat|Hors-bord/Vedette|sea\n4|Jet ski|Jet-ski/Scooter des mers|sea\n4|Raft|Radeau|sea\n3|Gondola|Gondole|sea\n3|Rowing boat/Rowboat|Barque|sea\n3|Hovercraft|Aéroglisseur|sea\n3|Lifeboat|Canot de sauvetage|sea\n3|Tanker|Pétrolier|sea\n3|Cargo ship/Container ship|Porte-conteneurs/Cargo|sea\n3|Aircraft carrier|Porte-avions|sea\n3|Warship/Battleship|Navire de guerre/Cuirassé|sea\n3|Pirate ship|Bateau pirate|sea\n3|Galleon|Galion|sea\n3|Canal boat/Narrowboat|Péniche|sea\n3|Catamaran||sea\n3|Paddle board/Paddle|Paddle|sea\n3|Pedalo|Pédalo|sea\n4|Jet/Jet plane|Jet/Avion à réaction|air\n3|Glider|Planeur|air\n3|Airship/Blimp/Zeppelin|Dirigeable/Zeppelin|air\n4|Drone||air\n4|Space shuttle|Navette spatiale|air\n4|Spaceship/Spacecraft|Vaisseau spatial|air\n3|Seaplane|Hydravion|air\n3|Fighter jet|Avion de chasse|air\n3|Paraglider|Parapente|air\n3|Hang glider|Deltaplane|air\n4|Cable car|Téléphérique|land\n3|Chairlift|Télésiège|land\n3|Funicular|Funiculaire|land\n3|Monorail||land\n4|High-speed train/TGV/Bullet train|TGV/Train à grande vitesse|land\n3|Steam train/Steam locomotive|Train à vapeur/Locomotive à vapeur|land\n3|Locomotive||land\n4|Coach|Autocar|land\n3|Double-decker bus/Double decker|Bus à impériale|land\n3|Minibus||land\n3|School bus|Bus scolaire|land\n4|Limousine/Limo|Limousine|land\n4|Jeep||land\n3|SUV|SUV/4x4|land\n3|Pickup truck/Pick-up|Pick-up|land\n4|Camper van/Motorhome/RV|Camping-car|land\n3|Caravan|Caravane|land\n4|Quad bike/Quad/ATV|Quad|land\n4|Go-kart/Kart|Kart|land\n3|Golf cart|Voiturette de golf|land\n4|Tank|Char/Tank|land\n4|Bulldozer||land\n3|Excavator/Digger|Pelleteuse/Pelle mécanique|land\n3|Crane|Grue|land\n3|Forklift|Chariot élévateur|land\n3|Dump truck/Tipper truck|Camion benne/Tombereau|land\n3|Cement mixer/Concrete mixer|Bétonnière/Camion toupie|land\n3|Garbage truck/Bin lorry|Camion poubelle/Benne à ordures|land\n3|Tow truck|Dépanneuse|land\n3|Snowplough/Snowplow|Chasse-neige|land\n3|Snowmobile|Motoneige|land\n4|Sled/Sledge/Sleigh|Luge/Traîneau|land\n3|Dog sled|Traîneau à chiens|land\n3|Carriage/Horse and carriage|Calèche/Carrosse|land\n3|Chariot|Char romain|land\n3|Rickshaw/Tuk-tuk|Pousse-pousse/Tuk-tuk|land\n3|Segway|Segway/Gyropode|land\n4|Hoverboard||land\n4|Unicycle|Monocycle|land\n4|Tricycle/Trike|Tricycle|land\n3|Tandem||land\n3|Moped|Mobylette/Cyclomoteur|land\n4|Roller skates/Rollerblades|Rollers/Patins à roulettes|land\n3|Wheelchair|Fauteuil roulant|land\n3|Pram/Stroller/Buggy|Poussette/Landau|land\n4|Racing car/Race car/Formula 1 car|Voiture de course/Formule 1|land\n3|Convertible/Cabriolet|Cabriolet/Décapotable|land\n3|Electric car|Voiture électrique|land\n3|Lunar rover/Moon buggy|Rover lunaire|land\n3|Mars rover/Rover|Rover|land\n3|Armoured car|Véhicule blindé|land\n0|Foot/Walking|À pied|no\n0|Wheel|Roue|no"},"cars":{"z":1,"d":["car","cars","voiture","voitures","motors"],"e":"9|Ferrari||\n8|Lamborghini||\n8|BMW||\n8|Mercedes/Mercedes-Benz||\n8|Tesla||\n8|Toyota||\n8|Audi||\n8|Porsche||\n7|Ford||\n7|Volkswagen/VW||\n7|Renault||\n7|Peugeot||\n7|Bugatti||\n7|Honda||\n6|Citroën/Citroen||\n6|Fiat||\n6|Nissan||\n6|Rolls-Royce/Rolls Royce||\n6|Bentley||\n6|McLaren||\n6|Aston Martin||\n6|Jaguar||\n6|Land Rover/Range Rover||\n6|Mini||\n6|Chevrolet/Chevy||\n6|Hyundai||\n6|Kia||\n6|Mazda||\n5|Volvo||\n4|Subaru||\n4|Mitsubishi||\n4|Suzuki||\n4|Lexus||\n5|Maserati||\n4|Alfa Romeo||\n4|Dacia||\n4|Skoda/Škoda||\n4|Seat/SEAT||\n4|Opel/Vauxhall||\n4|Smart||\n5|Jeep||\n4|Dodge||\n4|Cadillac||\n4|Lotus||\n4|Koenigsegg||\n4|Pagani||\n3|DS/DS Automobiles||\n3|Alpine||\n3|Cupra||\n3|Lancia||\n2|Abarth||\n3|BYD||\n3|Polestar||\n3|Rivian||\n2|Lucid||\n2|Genesis||\n3|Infiniti||\n3|Acura||\n2|Lincoln||\n2|Buick||\n2|GMC||\n3|Chrysler||\n2|Ram||\n3|Hummer||\n3|Pontiac||\n2|Saab||\n2|Rover||\n3|MG||\n2|Triumph||\n2|Morgan||\n2|TVR||\n3|Lada||\n2|Tata||\n2|Mahindra||\n2|Proton||\n2|Geely||\n2|Chery||\n2|Great Wall||\n2|NIO||\n2|Xpeng||\n2|Daewoo||\n2|SsangYong||\n2|Isuzu||\n2|Daihatsu||\n2|Simca||\n2|Talbot||\n2|Matra||\n2|Venturi||\n3|DeLorean||\n2|Trabant||\n2|Wartburg||\n2|Zastava||\n2|Datsun||\n2|Scion||\n2|Oldsmobile||\n2|Plymouth||\n2|Mercury||\n2|Saturn||\n2|Hispano-Suiza||\n3|Maybach||\n2|Spyker||\n3|Rimac||\n2|Hennessey||\n2|Noble||\n2|Caterham||\n2|Ariel||\n2|Ligier||\n2|Aixam||\n2|Microcar||\n2|Yamaha||no\n2|Ducati||no\n2|Harley-Davidson||no\n2|Kawasaki||no\n0|Uber||no\n0|Michelin||no"},"kitchen":{"z":1,"d":[],"e":"9|Fork|Fourchette|\n9|Knife|Couteau|\n9|Spoon|Cuillère/Cuiller|\n8|Fridge/Refrigerator|Frigo/Réfrigérateur/Frigidaire|\n8|Oven|Four|\n8|Microwave|Micro-ondes|\n7|Plate|Assiette|\n7|Pan/Frying pan|Poêle|\n7|Pot/Saucepan|Casserole/Marmite|\n7|Toaster|Grille-pain|\n7|Kettle|Bouilloire|\n7|Cup|Tasse|\n7|Glass|Verre|\n7|Bowl|Bol/Saladier|\n5|Mug||\n5|Dishwasher|Lave-vaisselle|\n5|Blender|Mixeur/Blender|\n5|Whisk|Fouet|\n5|Spatula|Spatule|\n4|Ladle|Louche|\n5|Sink|Évier|\n5|Freezer|Congélateur|\n5|Cooker/Stove/Hob|Cuisinière/Plaque de cuisson|\n5|Coffee machine/Coffee maker|Machine à café|\n5|Chopsticks|Baguettes|\n4|Rolling pin|Rouleau à pâtisserie|\n4|Grater|Râpe|\n4|Peeler|Économe/Éplucheur|\n4|Can opener/Tin opener|Ouvre-boîte|\n4|Bottle opener|Décapsuleur|\n3|Corkscrew|Tire-bouchon|\n4|Cutting board/Chopping board|Planche à découper|\n4|Colander/Strainer|Passoire|\n3|Sieve|Tamis|\n4|Teapot|Théière|\n4|Jug/Pitcher|Carafe/Pichet|\n4|Tray|Plateau|\n4|Napkin|Serviette|\n3|Tablecloth|Nappe|\n3|Oven glove/Oven mitt|Gant de cuisine/Manique|\n3|Apron|Tablier|\n4|Tongs|Pince/Pince de cuisine|\n3|Food processor|Robot de cuisine/Robot ménager|\n4|Mixer/Stand mixer|Batteur/Robot pâtissier|\n4|Scales/Kitchen scales|Balance/Balance de cuisine|\n3|Measuring cup/Measuring jug|Verre doseur|\n3|Timer/Kitchen timer|Minuteur|\n4|Wok||\n3|Pressure cooker|Cocotte-minute/Autocuiseur|\n3|Slow cooker|Mijoteuse|\n4|Air fryer|Friteuse à air/Air fryer|\n3|Deep fryer|Friteuse|\n3|Rice cooker|Cuiseur à riz|\n3|Juicer|Centrifugeuse/Presse-agrumes|\n3|Mortar and pestle|Mortier et pilon/Mortier|\n3|Baking tin/Cake tin|Moule à gâteau/Moule|\n3|Casserole dish/Dutch oven|Cocotte|\n3|Lid|Couvercle|\n4|Teaspoon|Petite cuillère|\n3|Tablespoon|Cuillère à soupe|\n3|Bread knife|Couteau à pain|\n3|Cleaver|Couperet/Hachoir|\n3|Kitchen roll/Paper towel|Essuie-tout/Sopalin|\n3|Tea towel/Dish towel|Torchon|\n3|Sponge|Éponge|\n3|Bin/Trash can|Poubelle|\n4|Cupboard|Placard|\n3|Shelf|Étagère|\n4|Tap/Faucet|Robinet|\n3|Extractor fan/Cooker hood|Hotte|\n3|Ice cube tray|Bac à glaçons|\n3|Thermos/Flask|Thermos|\n3|Lunch box|Boîte à repas/Lunch box|\n3|Tupperware/Food container|Tupperware/Boîte hermétique|\n3|Cling film/Plastic wrap|Film alimentaire/Film étirable|\n3|Aluminium foil/Tin foil|Papier aluminium/Papier alu|\n3|Baking paper/Parchment paper|Papier cuisson|\n3|Funnel|Entonnoir|\n3|Piping bag|Poche à douille|\n3|Pastry brush|Pinceau de cuisine|\n3|Potato masher|Presse-purée|\n3|Garlic press|Presse-ail|\n3|Salad spinner|Essoreuse à salade|\n3|Egg cup|Coquetier|\n3|Salt shaker/Salt cellar|Salière|\n3|Pepper mill/Pepper grinder|Moulin à poivre/Poivrière|\n3|Sugar bowl|Sucrier|\n3|Butter dish|Beurrier|\n3|Bread bin|Boîte à pain|\n3|Cafetière/French press|Cafetière à piston|\n3|Espresso machine|Machine à expresso|\n3|Waffle iron/Waffle maker|Gaufrier|\n3|Crêpe pan/Crepe maker|Crêpière/Poêle à crêpes|\n3|Raclette grill/Raclette machine|Appareil à raclette|\n3|Fondue set|Service à fondue/Caquelon|\n4|Barbecue/BBQ/Grill|Barbecue|\n3|Ice cream maker|Sorbetière|\n3|Bread maker/Breadmaker|Machine à pain|\n3|Kitchen scissors|Ciseaux de cuisine|\n3|Skewer|Brochette/Pique|\n3|Meat thermometer|Thermomètre de cuisson|\n3|Zester|Zesteur|\n3|Mandoline||\n3|Melon baller|Cuillère parisienne|\n3|Pizza cutter|Roulette à pizza|\n3|Ice cream scoop|Cuillère à glace|\n3|Nutcracker|Casse-noix|\n0|Table||no\n0|Chair|Chaise|no\n0|Food|Nourriture|no"},"tools":{"z":1,"d":[],"e":"9|Hammer|Marteau|\n8|Screwdriver|Tournevis|\n8|Saw|Scie|\n7|Drill|Perceuse|\n7|Wrench/Spanner|Clé/Clé à molette|\n7|Pliers|Pince|\n6|Axe|Hache|\n6|Shovel/Spade|Pelle/Bêche|\n5|Ladder|Échelle|\n5|Tape measure/Measuring tape|Mètre ruban/Mètre|\n5|Screw|Vis|\n5|Nail|Clou|\n5|Rake|Râteau|\n5|Scissors|Ciseaux|\n4|Chisel|Ciseau à bois/Burin|\n4|Level/Spirit level|Niveau/Niveau à bulle|\n4|Sandpaper|Papier de verre|\n4|Paintbrush|Pinceau|\n3|Paint roller|Rouleau de peinture|\n3|Hoe|Binette/Houe|\n5|Pickaxe|Pioche|\n4|Crowbar|Pied-de-biche|\n4|Mallet|Maillet|\n4|Sledgehammer|Masse|\n3|Hacksaw|Scie à métaux|\n5|Chainsaw|Tronçonneuse|\n3|Jigsaw|Scie sauteuse|\n3|Circular saw|Scie circulaire|\n3|Sander|Ponceuse|\n3|Grinder/Angle grinder|Meuleuse/Disqueuse|\n3|Nail gun|Cloueuse|\n3|Staple gun|Agrafeuse murale/Agrafeuse|\n4|Glue gun/Hot glue gun|Pistolet à colle|\n3|Soldering iron|Fer à souder|\n3|Welding torch/Welder|Poste à souder/Chalumeau|\n3|Blowtorch|Lampe à souder|\n3|Vice/Vise|Étau|\n3|Clamp|Serre-joint|\n4|Allen key/Hex key|Clé Allen/Clé hexagonale|\n3|Socket wrench/Ratchet|Clé à cliquet/Cliquet|\n3|Pipe wrench|Clé à tube|\n3|Wire cutters|Pince coupante|\n3|Wire stripper|Pince à dénuder|\n4|Utility knife/Stanley knife/Box cutter|Cutter|\n4|Penknife/Pocket knife/Swiss Army knife|Couteau suisse/Canif|\n4|File|Lime|\n3|Rasp|Râpe à bois|\n3|Plane|Rabot|\n3|Awl|Poinçon/Alène|\n4|Trowel|Truelle|\n3|Square/Set square|Équerre|\n4|Ruler|Règle|\n3|Pencil|Crayon|\n3|Stud finder|Détecteur de montants|\n3|Multimeter|Multimètre|\n4|Torch/Flashlight|Lampe torche/Lampe de poche|\n4|Toolbox|Boîte à outils|\n3|Workbench|Établi|\n4|Wheelbarrow|Brouette|\n4|Pitchfork/Fork|Fourche|\n3|Shears/Hedge trimmer|Cisaille/Taille-haie|\n3|Secateurs/Pruning shears|Sécateur|\n4|Lawn mower/Lawnmower|Tondeuse|\n3|Strimmer/String trimmer|Débroussailleuse|\n3|Leaf blower|Souffleur de feuilles|\n4|Watering can|Arrosoir|\n3|Hose/Garden hose|Tuyau d'arrosage|\n3|Scythe|Faux|\n3|Sickle|Faucille|\n3|Machete|Machette|\n3|Jack/Car jack|Cric|\n3|Tyre lever|Démonte-pneu|\n3|Pump/Bike pump|Pompe/Pompe à vélo|\n3|Pressure washer|Nettoyeur haute pression/Kärcher|\n3|Paint sprayer/Spray gun|Pistolet à peinture|\n3|Caulking gun|Pistolet à mastic|\n3|Putty knife/Scraper|Couteau à enduire/Spatule de peintre|\n3|Bolt cutters|Coupe-boulons|\n3|Tin snips|Cisaille à tôle|\n3|Router|Défonceuse|\n3|Lathe|Tour|\n3|Anvil|Enclume|\n3|Bellows|Soufflet|\n3|Plumb line/Plumb bob|Fil à plomb|\n3|Chalk line|Cordeau à tracer|\n3|Rivet gun|Riveteuse|\n3|Tap and die|Taraud et filière|\n3|Feeler gauge|Jauge d'épaisseur|\n3|Calliper/Caliper|Pied à coulisse|\n4|Duct tape|Ruban adhésif/Scotch|\n4|Glue|Colle|\n3|Drill bit|Mèche|\n0|Hand|Main|no\n0|Robot||no"},"furniture":{"z":1,"d":[],"e":"9|Chair|Chaise|\n9|Table||\n9|Bed|Lit|\n8|Sofa/Couch/Settee|Canapé/Divan|\n7|Wardrobe/Closet|Armoire/Penderie|\n7|Desk|Bureau|\n7|Armchair|Fauteuil|\n7|Bookcase/Bookshelf|Bibliothèque/Étagère à livres|\n7|Shelf|Étagère|\n7|Lamp|Lampe|\n7|Stool|Tabouret|\n5|Chest of drawers/Dresser|Commode|\n5|Bench|Banc|\n5|Cupboard|Placard|\n4|Cabinet|Meuble/Armoire de rangement|\n5|Bunk bed|Lits superposés|\n5|Mirror|Miroir|\n5|Rug/Carpet|Tapis|\n5|Coffee table|Table basse|\n5|Bedside table/Nightstand|Table de chevet|\n3|Dining table|Table à manger|\n4|Rocking chair|Fauteuil à bascule/Rocking-chair|\n4|Office chair|Chaise de bureau/Fauteuil de bureau|\n4|Gaming chair|Chaise gaming|\n4|Beanbag|Pouf poire|\n4|Sofa bed|Canapé-lit/Clic-clac|\n3|Futon||\n4|Hammock|Hamac|\n4|Cot/Crib|Lit bébé/Berceau|\n4|High chair|Chaise haute|\n4|Deckchair|Transat|\n3|Sun lounger|Bain de soleil|\n3|Recliner|Fauteuil inclinable|\n3|Chaise longue|Méridienne|\n4|Throne|Trône|\n4|Sideboard|Buffet|\n3|Display cabinet/China cabinet|Vitrine/Vaisselier|\n3|TV stand/TV unit|Meuble télé|\n3|Shoe rack|Meuble à chaussures/Range-chaussures|\n3|Coat rack/Coat stand|Porte-manteau|\n3|Hall table/Console table|Console|\n3|Dressing table/Vanity|Coiffeuse|\n3|Trunk/Chest|Coffre/Malle|\n3|Filing cabinet|Classeur/Meuble à tiroirs|\n3|Folding chair|Chaise pliante|\n3|Bar stool|Tabouret de bar|\n3|Headboard|Tête de lit|\n4|Mattress|Matelas|\n3|Four-poster bed|Lit à baldaquin|\n3|Corner sofa|Canapé d'angle|\n3|Loveseat|Causeuse|\n3|Pouffe/Pouf|Pouf|\n4|Cushion|Coussin|\n4|Curtains/Curtain|Rideaux/Rideau|\n3|Blinds|Stores|\n3|Wall clock/Clock|Horloge/Pendule|\n3|Grandfather clock|Horloge comtoise|\n4|Chandelier|Lustre|\n3|Floor lamp/Standard lamp|Lampadaire|\n4|Fireplace|Cheminée|\n3|Radiator|Radiateur|\n3|Piano||no\n3|Television/TV|Télévision/Télé|no\n3|Bathtub/Bath|Baignoire|no\n3|Toilet|Toilettes|no\n0|Door|Porte|no\n0|Window|Fenêtre|no\n0|Wall|Mur|no"},"boardgames":{"z":1,"d":[],"e":"9|Chess|Échecs|\n8|Monopoly||\n8|Scrabble||\n7|Checkers/Draughts|Dames/Jeu de dames|\n7|Cluedo/Clue||\n7|Connect Four/Connect 4|Puissance 4|\n7|Uno|UNO|\n7|Snakes and Ladders/Chutes and Ladders|Serpents et échelles|\n6|Ludo/Sorry!|Petits chevaux/Ludo|\n6|Battleship|Bataille navale|\n6|Risk||\n6|Trivial Pursuit||\n6|Jenga||\n6|Backgammon||\n6|Go||\n6|Mahjong||\n6|Catan/Settlers of Catan|Catan/Colons de Catane|\n6|Guess Who?/Guess Who|Qui est-ce ?/Qui est-ce|\n6|Operation|Docteur Maboul|\n6|Twister||\n6|Pictionary||\n6|Dominoes|Dominos|\n6|Mastermind||\n6|Yahtzee|Yahtzee/Yam's|\n4|Stratego||\n4|The Game of Life/Game of Life|Destins/Jeu de la vie|\n4|Mille Bornes||\n4|Dixit||\n4|Carcassonne||\n4|Ticket to Ride|Les Aventuriers du Rail|\n3|Pandemic|Pandémie|\n4|Codenames|Code Names|\n4|Exploding Kittens||\n4|Dobble/Spot it!|Dobble|\n4|Labyrinth|Labyrinthe|\n4|Hungry Hippos|Hippos gloutons|\n3|Mouse Trap|Attrape-souris|\n3|Kerplunk||\n4|Boggle||\n4|Taboo|Tabou|\n3|Blokus||\n4|Othello/Reversi||\n3|Chinese checkers/Chinese chequers|Dames chinoises|\n3|Mancala/Awale|Awalé/Mancala|\n3|Nine men's morris|Jeu du moulin|\n4|Tic-tac-toe/Noughts and crosses|Morpion|\n4|Dungeons & Dragons/D&D|Donjons et Dragons|\n4|Werewolf/Mafia|Loups-garous/Les Loups-garous de Thiercelieux|\n4|Skip-Bo||\n4|Rummikub||\n3|Azul||\n3|Splendor||\n3|7 Wonders||\n3|Kingdomino||\n3|Small World||\n3|Agricola||\n3|Terraforming Mars||\n3|Wingspan||\n3|Love Letter||\n3|Coup||\n3|Hanabi||\n3|Bang!||\n3|Munchkin||\n3|Gloomhaven||\n3|Cranium||\n3|Articulate||\n3|Bananagrams||\n3|Sequence||\n3|Crokinole||\n3|Shogi||\n3|Xiangqi/Chinese chess|Échecs chinois|\n3|Parcheesi/Pachisi||\n3|Cribbage||\n3|Halma||\n3|Diplomacy||\n3|Axis & Allies||\n3|6 nimmt!/6 qui prend|6 qui prend|\n4|Time's Up||\n4|Jungle Speed||\n4|Le Petit Bac/Scattergories|Petit Bac/Baccalauréat|\n4|Loto/Bingo|Loto|\n3|Belote||no\n3|Poker||no\n3|Tarot||no\n0|Solitaire||no\n0|Minecraft||no\n0|Fortnite||no"},"rhyme_light":{"z":1,"d":[],"e":"8|Night||\n7|Bright||\n7|Fight||\n7|Right||\n7|White||\n7|Kite||\n6|Bite||\n6|Sight||\n6|Might||\n6|Tight||\n6|Flight||\n5|Height||\n6|Write||\n4|Site||\n5|Quite||\n5|Knight||\n5|Fright||\n4|Delight||\n5|Tonight||\n4|Polite||\n4|Invite||\n3|Ignite||\n3|Unite||\n3|Excite||\n2|Recite||\n3|Despite||\n4|Slight||\n2|Plight||\n3|Spite||\n3|Sprite||\n2|Trite||\n2|Rite||\n2|Mite||\n2|Smite||\n3|Byte||\n2|Cite||\n2|Blight||\n2|Alight||\n1|Sleight||\n1|Wight||\n4|Dynamite||\n3|Satellite||\n3|Appetite||\n3|Termite||\n3|Parasite||\n3|Kryptonite||\n3|Meteorite||\n3|Overnight||\n2|Insight||\n2|Outright||\n2|Upright||\n2|Copyright||\n3|Daylight||\n3|Spotlight||\n3|Sunlight||\n3|Moonlight||\n3|Flashlight||\n3|Highlight||\n3|Twilight||\n4|Midnight||\n1|Birthright||\n2|Airtight||\n2|Uptight||\n3|Alright/All right||\n1|Contrite||\n2|Oversight||\n3|Website||\n1|Bullfight||\n1|Firefight||\n1|Playwright||\n2|Fahrenheit||\n1|Socialite||\n1|Erudite||\n1|Expedite||\n1|Anthracite||\n2|Graphite||\n1|Bauxite||\n1|Neophyte||\n1|Acolyte||\n1|Extradite||\n1|Reunite||\n2|Rewrite||\n1|Underwrite||\n2|Frostbite||\n1|Snakebite||\n1|Lamplight||\n2|Starlight||\n1|Firelight||\n2|Candlelight||\n1|Searchlight||\n2|Headlight||\n1|Taillight||\n1|Floodlight||\n1|Stoplight||\n1|Limelight||\n1|Torchlight||\n1|Skylight||\n1|Lignite||\n1|Cellulite||\n2|Stalactite||\n2|Stalagmite||\n1|Dolomite||\n1|Luddite||\n1|Indict||\n2|Snow White||\n2|Goodnight/Good night||\n1|Bight||\n1|Wright||\n1|Nightlight||\n1|Gaslight||\n1|Incite||\n1|Lite||\n1|Sound bite/Soundbite||\n1|Mosquito bite||\n1|Black and white||\n1|Pillow fight||\n1|Food fight||\n1|First sight||\n1|Hindsight||\n1|Foresight||\n1|Bombsight||\n0|Light||no\n0|Lit||no"},"rhyme_day":{"z":1,"d":[],"e":"8|Say||\n8|Play||\n7|Way||\n6|May||\n6|Stay||\n6|Pay||\n5|Hay||\n5|Ray||\n4|Bay||\n4|Clay||\n6|Grey/Gray||\n6|Okay/OK||\n6|Away||\n7|Today||\n4|Yesterday||\n5|Birthday||\n5|Holiday||\n4|Sunday||\n4|Monday||\n3|Tuesday||\n3|Wednesday||\n3|Thursday||\n4|Friday||\n3|Saturday||\n4|Pray||\n3|Prey||\n4|Spray||\n3|Stray||\n4|Tray||\n3|Sway||\n3|Slay||\n1|Flay||\n2|Fray||\n1|Bray||\n2|Jay||\n4|Lay||\n2|Nay||\n2|Neigh||\n3|Weigh||\n3|Sleigh||\n4|They||\n3|Obey||\n2|Convey||\n2|Survey||\n3|Display||\n3|Delay||\n2|Decay||\n2|Relay||\n3|Essay||\n2|Array||\n2|Betray||\n2|Portray||\n3|Ballet||\n3|Bouquet||\n2|Buffet||\n2|Café/Cafe||\n2|Cliché/Cliche||\n1|Fiancé/Fiance||\n1|Résumé/Resume||\n1|Sauté/Saute||\n2|Valet||\n2|Beret||\n2|Chalet||\n2|Duvet||\n2|Gourmet||\n1|Parquet||\n2|Croquet||\n1|Ricochet||\n1|Cabaret||\n2|Crochet||\n1|Sachet||\n1|Filet||\n2|Gateway||\n3|Highway||\n3|Subway||\n2|Railway||\n2|Runway||\n2|Hallway||\n2|Doorway||\n2|Driveway||\n1|Stairway||\n2|Pathway||\n2|Motorway||\n2|Freeway||\n1|Airway||\n4|Anyway||\n2|Someday||\n2|Everyday||\n2|Midday||\n2|Mayday||\n1|Payday||\n1|Heyday||\n1|Doomsday||\n2|Weekday||\n1|Workday||\n2|Broadway||\n3|Norway||\n1|Santa Fe||\n4|Hey||\n3|Hooray/Hurray||\n1|Olé/Ole||\n3|X-ray||\n2|Stingray||\n1|Ashtray||\n1|Disarray||\n1|Dismay||\n1|Astray||\n1|Allay||\n1|Waylay||\n1|Inlay||\n3|Replay||\n1|Outplay||\n1|Screenplay||\n1|Swordplay||\n1|Horseplay||\n1|Roleplay/Role-play||\n1|Matinee/Matinée||\n1|Protégé/Protege||\n1|Toupée/Toupee||\n1|Attaché/Attache||\n1|Entrée/Entree||\n1|Soufflé/Souffle||\n1|Purée/Puree||\n1|Communiqué||\n1|Consommé||\n1|DJ||\n1|Splay||\n1|Sashay||\n1|Overstay||\n1|Underway||\n1|Faraway||\n1|Castaway||\n1|Getaway||\n1|Hideaway||\n1|Runaway||\n1|Takeaway||\n1|Giveaway||\n1|Stowaway||\n1|Breakaway||\n1|Throwaway||\n1|Milky Way||\n1|Café au lait||\n0|Day||no\n0|Days||no"},"rhyme_cat":{"z":1,"d":[],"e":"7|Bat||\n7|Hat||\n7|Rat||\n6|Mat||\n5|Sat||\n6|Fat||\n5|Flat||\n5|That||\n4|Pat||\n4|Chat||\n3|Brat||\n3|Gnat||\n3|Splat||\n2|Spat||\n2|Scat||\n2|Slat||\n1|Sprat||\n1|Tat||\n2|Vat||\n1|Drat||\n2|Stat||\n1|Frat||\n3|At||\n3|Acrobat||\n2|Aristocrat||\n1|Autocrat||\n2|Bureaucrat||\n2|Democrat||\n3|Diplomat||\n2|Doormat||\n3|Format||\n3|Habitat||\n1|Laundromat||\n2|Thermostat||\n3|Wombat||\n2|Combat||\n3|Copycat||\n2|Chitchat||\n2|Tomcat||\n2|Bobcat||\n2|Wildcat||\n1|Hazmat||\n1|Nonfat||\n1|Polecat||\n1|Muskrat||\n1|Ziggurat||\n1|Dingbat||\n1|Fruit bat||\n2|Cravat||\n1|Begat||\n1|Plait||\n1|Caveat||\n1|Technocrat||\n1|Plutocrat||\n1|Sun hat/Sunhat||\n1|Top hat||\n1|Hard hat||\n1|Welcome mat||\n1|Yoga mat||\n1|Kit Kat/KitKat||\n1|Rat-a-tat||\n1|Cowboy hat||\n1|Bowler hat||\n1|Party hat||\n1|Mouse mat||\n1|Placemat||\n1|Vampire bat||\n1|Cricket bat||\n1|Baseball bat||\n1|Low-fat||\n1|Pitapat/Pitter-pat||\n0|Cat||no\n0|Cats||no"},"rhyme_cake":{"z":1,"d":[],"e":"7|Bake||\n7|Lake||\n7|Make||\n7|Snake||\n6|Take||\n6|Shake||\n6|Wake||\n6|Fake||\n5|Rake||\n4|Flake||\n4|Brake||\n6|Break||\n4|Stake||\n6|Steak||\n3|Sake||\n4|Quake||\n3|Drake||\n4|Awake||\n5|Mistake||\n5|Pancake||\n5|Cupcake||\n4|Earthquake||\n3|Cornflake||\n5|Snowflake||\n4|Milkshake||\n3|Handshake||\n2|Keepsake||\n2|Namesake||\n1|Outtake||\n2|Intake||\n1|Uptake||\n1|Partake||\n2|Forsake||\n2|Remake||\n1|Retake||\n2|Overtake||\n2|Undertake||\n3|Heartache||\n4|Headache||\n2|Stomach ache||\n3|Toothache||\n2|Bellyache||\n3|Ache||\n1|Slake||\n1|Sheikh/Sheik||\n2|Opaque||\n2|Fruitcake||\n3|Cheesecake||\n1|Mandrake||\n1|Sweepstake||\n3|Rattlesnake||\n1|Clambake||\n1|Grass snake||\n1|Sea snake||\n1|Corn snake||\n1|Wide awake||\n1|Daybreak||\n1|Jailbreak||\n1|Outbreak||\n1|Heartbreak||\n1|Windbreak||\n1|Tea break||\n1|Lunch break||\n1|Spring break||\n1|Mudcake||\n1|Beefcake||\n1|Hotcake||\n1|Shortcake||\n1|Fishcake||\n1|Rice cake||\n0|Cake||no\n0|Cakes||no"},"fin_eau":{"z":1,"d":[],"e":"8|Bateau||\n8|Chapeau||\n8|Gâteau||\n7|Oiseau||\n7|Château||\n7|Cadeau||\n6|Couteau||\n5|Rideau||\n6|Tableau||\n6|Manteau||\n5|Chameau||\n6|Bureau||\n5|Cerveau||\n5|Niveau||\n5|Morceau||\n4|Panneau||\n4|Réseau||\n4|Ruisseau||\n3|Roseau||\n4|Troupeau||\n4|Berceau||\n4|Carreau||\n3|Ciseau||\n5|Corbeau||\n5|Drapeau||\n3|Fardeau||\n3|Flambeau||\n3|Fourneau||\n3|Hameau||\n4|Jumeau||\n2|Lambeau||\n5|Marteau||\n4|Moineau||\n4|Museau||\n5|Nouveau||\n4|Pinceau||\n5|Plateau||\n4|Poireau||\n3|Pruneau||\n3|Rameau||\n4|Rouleau||\n2|Sceau||\n5|Seau||\n5|Taureau||\n4|Tombeau||\n4|Tonneau||\n4|Traîneau||\n3|Trousseau||\n4|Vaisseau||\n5|Veau||\n5|Agneau||\n4|Anneau||\n2|Arbrisseau||\n6|Beau||\n3|Bandeau||\n2|Biseau||\n1|Boisseau||\n1|Bordereau||\n3|Bourreau||\n3|Cerceau||\n3|Copeau||\n2|Coteau||\n3|Créneau||\n4|Eau||\n2|Escabeau||\n2|Faisceau||\n2|Fléau||\n3|Fuseau||\n1|Gruau||\n2|Lionceau||\n2|Louveteau||\n3|Maquereau||\n2|Monceau||\n2|Naseau||\n1|Ormeau||\n2|Perdreau||\n3|Pipeau||\n3|Préau||\n4|Radeau||\n2|Renouveau||\n2|Sureau||\n2|Tréteau||\n1|Vermisseau||\n3|Chevreau||\n3|Caniveau||\n2|Chalumeau||\n3|Chapiteau||\n2|Souriceau||\n2|Éléphanteau||\n2|Baleineau||\n2|Lapereau||\n2|Dindonneau||\n1|Pigeonneau||\n3|Barreau||\n3|Bigorneau||\n3|Blaireau||\n3|Bouleau||\n1|Cerneau||\n1|Chéneau||\n1|Cordeau||\n1|Cuisseau||\n1|Fricandeau||\n2|Linteau||\n1|Oripeau||\n6|Peau||\n4|Poteau||\n4|Râteau||\n1|Trumeau||\n2|Arceau||\n1|Jouvenceau||\n1|Damoiseau||\n1|Pourceau||\n3|Étourneau||\n1|Rondeau||\n2|Pommeau||\n2|Renardeau||\n2|Escargot||no\n2|Sabot||no\n2|Bientôt||no\n2|Tuyau||no\n2|Noyau||no\n2|Château d'eau||\n2|Coup de chapeau||\n2|Bateau-mouche||\n2|Porte-manteau||"},"fin_ette":{"z":1,"d":[],"e":"6|Assiette||\n7|Baguette||\n6|Bicyclette||\n7|Chaussette||\n7|Fourchette||\n6|Lunette/Lunettes||\n6|Omelette||\n5|Toilette/Toilettes||\n5|Trompette||\n5|Raquette||\n6|Casquette||\n5|Allumette||\n3|Amulette||\n3|Bavette||\n4|Belette||\n3|Blanquette||\n4|Boulette||\n5|Brouette||\n2|Burette||\n2|Buvette||\n4|Cachette||\n2|Cagette||\n4|Camionnette||\n4|Cassette||\n4|Cigarette||\n5|Clarinette||\n4|Clochette||\n4|Côtelette||\n3|Couchette||\n6|Crevette||\n2|Disquette||\n3|Éprouvette||\n4|Étiquette||\n2|Facette||\n4|Fillette||\n4|Fléchette||\n5|Galette||\n2|Gazette||\n4|Girouette||\n3|Gourmette||\n2|Guinguette||\n3|Hachette||\n2|Layette||\n4|Mallette||\n5|Manette||\n5|Marionnette||\n2|Mauviette||\n4|Miette||\n3|Mobylette||\n3|Moquette||\n6|Mouette||\n2|Musette||\n5|Noisette||\n4|Palette||\n4|Paillette/Paillettes||\n4|Pâquerette||\n4|Pirouette||\n5|Poussette||\n5|Recette||\n4|Roulette||\n4|Salopette||\n6|Serviette||\n4|Sonnette||\n5|Sucette||\n5|Tablette||\n3|Tartelette||\n5|Trottinette||\n3|Vignette||\n4|Vinaigrette||\n4|Violette||\n6|Chouette||\n5|Alouette||\n3|Devinette||\n3|Épuisette||\n3|Gâchette||\n2|Goélette||\n2|Houlette||\n2|Jupette||\n2|Kitchenette||\n2|Lavette||\n3|Maisonnette||\n3|Majorette||\n3|Maquette||\n3|Minette||\n4|Navette||\n2|Oubliette||\n3|Pincette||\n4|Pochette||\n5|Raclette||\n3|Rillettes||\n3|Roquette||\n3|Savonnette||\n2|Sœurette||\n4|Squelette||\n3|Statuette||\n2|Sandalette||\n4|Silhouette||\n2|Tirette||\n4|Vedette||\n2|Cordelette||\n2|Lorgnette||\n2|Oreillette||\n2|Chaînette||\n4|Charrette||\n3|Cueillette||\n2|Emplette||\n3|Fossette||\n2|Frisette||\n2|Gambette||\n1|Historiette||\n1|Mignonnette||\n3|Molette||\n3|Mouillette||\n3|Nette||\n4|Dette||\n4|Cette||\n4|Brochette||\n3|Coquette||\n3|Corvette||\n3|Cuvette||\n2|Dînette||\n2|Épinette||\n2|Estafette||\n3|Gaufrette||\n1|Grisette||\n3|Muette||\n2|Planchette||\n3|Plaquette||\n3|Poulette||\n1|Sornette||\n2|Cornette||\n3|Castagnettes/Castagnette||\n3|Fauvette||\n3|Rainette||\n2|Chevrette||\n3|Supérette||\n3|Banquette||\n2|Barrette||\n2|Bergeronnette||\n2|Boîte||no\n2|Brunette||\n2|Calepin||no\n2|Chemisette||\n2|Courgette||\n2|Cuisinette||\n2|Fourgonnette||\n2|Guérite||no\n2|Lingette||\n2|Pipette||\n2|Réglette||\n2|Sarriette||\n2|Sucrette||\n2|Tapette||\n2|Tétine||no\n2|Vachette||\n2|Baïonnette||\n2|Brindille||no\n2|Clarinettiste||no\n2|Marmite||no\n2|Cuillère||no\n0|Ette||no"},"fin_oir":{"z":1,"d":[],"e":"7|Miroir||\n6|Couloir||\n6|Trottoir||\n6|Tiroir||\n6|Mouchoir||\n5|Arrosoir||\n6|Rasoir||\n4|Peignoir||\n5|Comptoir||\n5|Dortoir||\n6|Espoir||\n6|Devoir||\n6|Pouvoir||\n6|Savoir||\n6|Vouloir||\n7|Voir||\n8|Soir||\n8|Noir||\n6|Avoir||\n5|Bonsoir||\n6|Au revoir||\n4|Revoir||\n4|Recevoir||\n3|Apercevoir||\n3|Décevoir||\n3|Concevoir||\n2|Percevoir||\n3|Prévoir||\n3|Pleuvoir||\n3|Valoir||\n2|Falloir||\n3|Asseoir/S'asseoir||\n2|Émouvoir||\n2|Mouvoir||\n1|Déchoir||\n1|Échoir||\n1|Surseoir||\n2|Entrevoir||\n2|Pourvoir||\n2|Promouvoir||\n3|Abreuvoir||\n3|Accoudoir||\n1|Assommoir||\n3|Bougeoir||\n2|Boudoir||\n2|Crachoir||\n1|Déversoir||\n4|Désespoir||\n1|Dévidoir||\n3|Égouttoir||\n4|Entonnoir||\n2|Éteignoir||\n3|Fermoir||\n2|Fumoir||\n2|Grattoir||\n3|Hachoir||\n2|Heurtoir||\n3|Isoloir||\n2|Juchoir||\n1|Laminoir||\n3|Lavoir||\n4|Manoir||\n1|Mouroir||\n3|Nichoir||\n1|Ouvroir||\n3|Parloir||\n3|Perchoir||\n1|Polissoir||\n3|Pressoir||\n2|Promenoir||\n1|Remontoir||\n1|Reposoir||\n4|Réservoir||\n4|Séchoir||\n2|Semoir||\n3|Terroir||\n2|Tranchoir||\n2|Urinoir||\n3|Abattoir||\n1|Couvoir||\n1|Encensoir||\n1|Ostensoir||\n2|Plantoir||\n4|Plongeoir||\n1|Saloir||\n2|Sautoir||\n1|Suçoir||\n1|Battoir||\n2|Butoir||\n4|Loir||\n1|Choir||\n1|Seoir||\n3|Rasoir électrique||\n3|Trou noir||\n3|Tableau noir||\n2|Film noir||\n3|Pouvoir d'achat||\n2|Mémoire||no\n2|Histoire||no\n2|Armoire||no\n2|Victoire||no\n2|Poire||no\n2|Boire||no\n2|Foire||no\n2|Gloire||no\n2|Croire||no\n2|Baignoire||no\n2|Mâchoire||no\n2|Passoire||no\n2|Écritoire||no"},"fin_age":{"z":1,"d":[],"e":"7|Fromage||\n6|Garage||\n7|Voyage||\n7|Nuage||\n7|Plage||\n6|Visage||\n6|Image||\n6|Page||\n6|Cage||\n5|Sage||\n5|Âge||\n6|Orage||\n6|Village||\n6|Courage||\n6|Message||\n5|Bagage/Bagages||\n5|Étage||\n5|Dommage||\n5|Mariage||\n4|Ménage||\n4|Massage||\n5|Passage||\n5|Paysage||\n5|Personnage||\n3|Plumage||\n4|Potage||\n2|Ramage||\n4|Rivage||\n5|Sauvage||\n3|Sondage||\n4|Stage||\n3|Tapage||\n3|Témoignage||\n3|Tirage||\n4|Virage||\n2|Adage||\n2|Alliage||\n3|Apprentissage||\n3|Arrosage||\n3|Atterrissage||\n4|Avantage||\n4|Barrage||\n3|Bavardage||\n2|Blindage||\n2|Bocage||\n4|Bricolage||\n2|Brouillage||\n3|Cartilage||\n3|Chantage||\n4|Chauffage||\n4|Chômage||\n2|Clonage||\n3|Collage||\n4|Coloriage||\n4|Coquillage||\n2|Cordage||\n2|Corsage||\n3|Cottage||\n3|Dérapage||\n3|Dressage||\n3|Décollage||\n3|Démarrage||\n3|Dépannage||\n2|Désavantage||\n2|Dopage||\n2|Drainage||\n3|Éclairage||\n3|Élevage||\n3|Emballage||\n2|Embrayage||\n2|Enfantillage||\n2|Engrenage||\n3|Entourage||\n3|Équipage||\n3|Esclavage||\n3|Espionnage||\n2|Essorage||\n3|Feuillage||\n2|Forage||\n2|Fuselage||\n2|Gage||\n3|Gaspillage||\n2|Gavage||\n2|Gommage||\n3|Grillage||\n4|Héritage||\n3|Hommage||\n4|Jardinage||\n4|Langage||\n3|Lavage||\n4|Maquillage||\n3|Marécage||\n2|Marquage||\n4|Mirage||\n3|Montage||\n2|Mouillage||\n4|Naufrage||\n4|Nettoyage||\n3|Otage||\n2|Outrage||\n3|Ouvrage||\n3|Pâturage||\n3|Péage||\n3|Pèlerinage||\n3|Piratage||\n2|Pillage||\n2|Plombage||\n3|Pliage||\n4|Pourcentage||\n2|Présage||\n3|Ravage||\n4|Recyclage||\n2|Rinçage||\n2|Rodage||\n2|Rouage||\n3|Sabotage||\n3|Sarcophage||\n2|Sevrage||\n4|Tatouage||\n2|Tissage||\n3|Tournage||\n2|Trucage||\n3|Usage||\n1|Veuvage||\n2|Vernissage||\n2|Vitrage||\n3|Voisinage||\n2|Fourrage||\n3|Carnage||\n3|Mage||\n4|Rage||\n4|Nage||\n2|Ombrage||\n2|Breuvage||\n3|Bandage||\n2|Dosage||\n2|Réglage||\n2|Séchage||\n3|Freinage||\n2|Parrainage||\n4|Partage||\n3|Patinage||\n1|Babillage||\n1|Bourrage||\n3|Cirage||\n2|Essayage||\n2|Lainage||\n2|Ramassage||\n3|Repassage||\n2|Sillage||\n2|Triage||\n2|Ancrage||\n2|Arbitrage||\n2|Assemblage||\n2|Branchage||\n2|Cadrage||\n2|Câblage||\n4|Camouflage||\n3|Carrelage||\n2|Compostage||\n3|Covoiturage||\n2|Gardiennage||\n2|Labourage||\n2|Marchandage||\n2|Mixage||\n2|Papotage||\n2|Parachutage||\n2|Patronage||\n1|Persiflage||\n2|Pistage||\n2|Quadrillage||\n2|Raccommodage||\n2|Radotage||\n2|Remorquage||\n2|Sciage||\n2|Tressage||\n2|Vagabondage||\n2|Glaçage||\n2|Kilométrage||\n2|Métrage||\n2|Minutage||\n2|Paquetage||\n3|Stockage||\n2|Sous-titrage||\n3|Doublage||\n3|Bronzage||\n3|Fromage blanc||\n2|Badge||no\n2|Magie||no\n2|Manège||no\n2|Neige||no\n2|Piège||no"}};
const LS_PROMPTS = [["country-any","country","d","countries:*","A country",""],["country-af","country","d","countries:af","A country in Africa",""],["country-as","country","d","countries:as","A country in Asia",""],["country-eu","country","d","countries:eu","A country in Europe",""],["country-na","country","d","countries:na","A country in North or Central America",""],["country-sa","country","e","countries:sa","A country in South America",""],["country-oc","country","e","countries:oc","A country in Oceania",""],["country-ll","country","d","countries:ll","A landlocked country",""],["country-isl","country","d","countries:isl","An island country",""],["country-letter-a","country","d","countries:*","A country starting with {x}","A"],["country-letter-b","country","d","countries:*","A country starting with {x}","B"],["country-letter-c","country","d","countries:*","A country starting with {x}","C"],["country-letter-m","country","d","countries:*","A country starting with {x}","M"],["country-letter-s","country","d","countries:*","A country starting with {x}","S"],["country-letter-t","country","d","countries:*","A country starting with {x}","T"],["country-letter2-g","country","e","countries:*","A country starting with {x}","G"],["country-letter2-n","country","e","countries:*","A country starting with {x}","N"],["country-letter2-p","country","e","countries:*","A country starting with {x}","P"],["capital-any","capital","d","capitals:*","A capital city",""],["capital-eu","capital","d","capitals:eu","A capital city in Europe",""],["capital-as","capital","d","capitals:as","A capital city in Asia",""],["capital-af","capital","d","capitals:af","A capital city in Africa",""],["capital-am","capital","d","capitals:na,sa","A capital city in the Americas",""],["us-state","capital","d","us_states:*","A US state",""],["us-state-letter-m","capital","e","us_states:*","A US state starting with {x}","M"],["us-state-letter-n","capital","e","us_states:*","A US state starting with {x}","N"],["city-fr","places","d","cities:fr","A city in France",""],["city-us","places","d","cities:us","A city in the United States",""],["city-uk","places","d","cities:uk","A city in the United Kingdom",""],["city-it","places","d","cities:it","A city in Italy",""],["city-es","places","d","cities:es","A city in Spain",""],["city-de","places","d","cities:de","A city in Germany",""],["city-jp","places","d","cities:jp","A city in Japan",""],["city-ca","places","e","cities:ca","A city in Canada",""],["river","places","d","rivers:*","A river",""],["river-eu","places","d","rivers:eu","A river in Europe",""],["river-fr","places","e","rivers:fr","A river in France",""],["sea","places","d","seas:*","A sea or ocean",""],["island","places","d","islands:*","An island",""],["mountain","places","d","mountains:*","A mountain or mountain range",""],["desert","places","d","deserts:*","A desert",""],["lake","places","d","lakes:*","A lake",""],["landmark","places","d","landmarks:*","A famous landmark or monument",""],["animal","animals","d","animals:*","An animal",""],["mammal","animals","d","animals:mam","A mammal",""],["bird","animals","d","animals:bird","A bird",""],["fish","animals","d","animals:fish","A fish",""],["reptile","animals","d","animals:rep,amp","A reptile or amphibian",""],["insect","animals","d","animals:ins","An insect",""],["sea-creature","animals","d","animals:sea","A sea creature",""],["farm-animal","animals","d","animals:farm","A farm animal",""],["african-animal","animals","d","animals:af","An animal that lives wild in Africa",""],["aus-animal","animals","e","animals:aus","An animal that lives in Australia",""],["polar-animal","animals","e","animals:arc","An animal of the polar regions",""],["animal-letter-b","animals","d","animals:*","An animal starting with {x}","B"],["animal-letter-c","animals","d","animals:*","An animal starting with {x}","C"],["animal-letter-m","animals","d","animals:*","An animal starting with {x}","M"],["animal-letter-s","animals","d","animals:*","An animal starting with {x}","S"],["animal-letter-t","animals","d","animals:*","An animal starting with {x}","T"],["animal-letter2-g","animals","e","animals:*","An animal starting with {x}","G"],["animal-letter2-p","animals","e","animals:*","An animal starting with {x}","P"],["dog-breed","animals","d","dogs:*","A dog breed",""],["dinosaur","nature","d","prehistoric:*","A dinosaur or prehistoric creature",""],["tree","nature","d","trees:*","A tree",""],["flower","nature","d","flowers:*","A flower",""],["gem","nature","d","gems:*","A gemstone, rock or mineral",""],["moon-planet","space","d","moons:earth,mars,jup,sat,ura,nep","A planet’s moon",""],["moon-solar","space","d","moons:*","A moon in our Solar System",""],["moon-jupiter","space","e","moons:jup","A moon of Jupiter",""],["moon-saturn","space","e","moons:sat","A moon of Saturn",""],["constellation","space","d","constellations:*","A constellation",""],["star","space","d","stars:*","A star other than the Sun",""],["element","science","d","elements:*","A chemical element",""],["metal","science","d","elements:metal","A metal from the periodic table",""],["element-ium","science","d","elements:*~ium","A chemical element ending in “-ium”",""],["body-part","science","d","body:*","A part of the human body",""],["bone","science","d","body:bone","A bone in the human body",""],["organ","science","e","body:org","An organ of the human body",""],["fruit","food","d","fruits:*","A fruit",""],["vegetable","food","d","vegetables:*","A vegetable",""],["cheese","food","d","cheeses:*","A cheese",""],["spice","food","d","spices:*","A herb or spice",""],["dessert","food","d","desserts:*","A dessert",""],["dish-it","food","d","dishes:it","An Italian dish",""],["dish-fr","food","d","dishes:fr","A French dish",""],["dish-jp","food","d","dishes:jp","A Japanese dish",""],["dish-mx","food","d","dishes:mx","A Mexican dish",""],["dish-in","food","d","dishes:in","An Indian dish",""],["dish-cn","food","d","dishes:cn","A Chinese dish",""],["pasta","food","d","pasta:*","A type of pasta",""],["bread","food","d","breads:*","A type of bread or pastry",""],["sauce","food","d","sauces:*","A sauce or dip",""],["instrument","culture","d","instruments:*","A musical instrument",""],["string-instrument","culture","e","instruments:str","A string instrument",""],["wind-instrument","culture","e","instruments:wind","A wind instrument",""],["genre","culture","d","genres:*","A music genre",""],["dance","culture","d","dances:*","A dance",""],["language","culture","d","languages:*","A language",""],["board-game","culture","d","boardgames:*","A board game",""],["myth-greek","culture","d","mythology:greek","A figure from Greek mythology",""],["myth-other","culture","d","mythology:roman,norse,egypt","A Roman, Norse or Egyptian god or legend",""],["us-president","people","d","us_presidents:*","A president of the United States",""],["fr-president","people","d","fr_presidents:*","A president of France",""],["scientist","people","d","scientists:*","A famous scientist",""],["painter","people","d","painters:*","A famous painter or artist",""],["composer","people","d","composers:*","A composer of classical or film music",""],["explorer","people","d","explorers:*","A famous explorer, aviator or astronaut",""],["emperor","people","d","emperors:*","A Roman emperor",""],["fr-king","people","d","fr_kings:*","A king of France",""],["sport","sport","d","sports:*","A sport",""],["olympic","sport","d","sports:oly","An Olympic sport or event",""],["ball-sport","sport","d","sports:ball","A sport played with a ball",""],["job","things","d","jobs:*","A job",""],["clothing","things","d","clothing:*","An item of clothing",""],["colour","things","d","colours:*","A colour",""],["vehicle","things","d","vehicles:*","A vehicle or way to travel",""],["vehicle-water","things","e","vehicles:sea","Something that travels on or under water",""],["car-brand","things","d","cars:*","A car brand",""],["kitchen","things","d","kitchen:*","Something you find in a kitchen",""],["tool","things","d","tools:*","A tool",""],["furniture","things","d","furniture:*","A piece of furniture",""],["currency","things","d","currencies:*","A currency, past or present",""],["w-light","words","d","en=rhyme_light;fr=fin_eau","A word that rhymes with “light”",""],["w-day","words","d","en=rhyme_day;fr=fin_ette","A word that rhymes with “day”",""],["w-cat","words","d","en=rhyme_cat;fr=fin_oir","A word that rhymes with “cat”",""],["w-cake","words","d","en=rhyme_cake;fr=fin_age","A word that rhymes with “cake”",""]];
const LS_ID = 'long-shot';
const LS_D0 = Date.UTC(2026, 10, 13);
const LS_K = 200;
const LS_SECS = 25;
const LS_DUEL_SECS = 15;
const LS_N = 7;
const LS_AU = 149597870.7;
const LS_TIERS = [
  { n: 'Stardust', p: 10, min: .1, c: '#b9c3dd', e: '⚪' },
  { n: 'Satellite', p: 20, min: .04, c: '#4aa8ff', e: '🔵' },
  { n: 'Comet', p: 35, min: .015, c: '#36d6a0', e: '🟢' },
  { n: 'Nebula', p: 55, min: .006, c: '#b77dff', e: '🟣' },
  { n: 'Supernova', p: 80, min: .002, c: '#ff8b3d', e: '🟠' },
  { n: 'Long Shot', p: 100, min: 0, c: '#ffd447', e: '🟡' }
];
const LS_MISS = { n: 'No answer', p: 0, c: '#5d6684', e: '⚫' };
const LS_BODIES = [
  { n: 'Earth', au: 1 }, { n: 'Mars', au: 1.52 }, { n: 'Asteroid belt', au: 2.7 }, { n: 'Jupiter', au: 5.2 }, { n: 'Saturn', au: 9.58 },
  { n: 'Uranus', au: 19.2 }, { n: 'Neptune', au: 30.07 }, { n: 'Pluto', au: 39.5 }, { n: 'Kuiper Belt', au: 48 }, { n: 'Eris', au: 67.9 },
  { n: 'Termination shock', au: 94 }, { n: 'Heliopause', au: 121 }, { n: 'Voyager 1', au: 167 }, { n: 'Oort Cloud', au: 2000 }
];
const LS_ART = new Set(['the', 'a', 'an', 'le', 'la', 'les', 'l', 'un', 'une', 'des', 'du', 'de', 'd']);
const LS_SYN = { st: 'saint', ste: 'sainte', mt: 'mount' };
const LS_MAPC = { 'œ': 'oe', 'æ': 'ae', 'ß': 'ss', 'ø': 'o', 'ł': 'l', 'đ': 'd', 'ı': 'i', 'þ': 'th', 'ð': 'd' };
const LS_RUDE = /(^|[^a-z])(f+u+c*k+|sh+i+t+|b+i+t+c+h+|c+u+n+t+|n+i+gg+(?:e+r+|a+)|f+a+g+(?:g*o+t+)?|r+e+t+a+r+d+(?:e+d+|s+)|wh+o+r+e+|s+l+u+t+|d+i+c+k+h+e+a+d+|p+u+s+s+y+|c+o+c+k+s+u+c+k+|a+s+s+h+o+l+e+|b+a+s+t+a+r+d+|w+a+n+k+|t+w+a+t+|p+o+r+n+o*|r+a+p+e+|k+y+s+|p+e+d+o+|put(?:e|ain)|salop(?:e|ard)|conn(?:ard|asse)|encul[eé]|merde|niqu(?:e|er)|nazi|hitler)(?:s|e[dr]|ing|y)?(?![a-z])/;
const LS_LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's' };

const lsLang = () => { const g = window.gpI18n; return g && typeof g.lang === 'string' ? g.lang : 'en'; };
const T = (s, o) => {
  const g = window.gpI18n;
  if (g && typeof g.t === 'function') { try { return g.t(s, o); } catch (e) {} }
  return o ? String(s).replace(/\{(\w+)\}/g, (m, k) => k in o ? o[k] : m) : s;
};
const lsEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const lsFmt = (n, d) => { const k = d || 0; try { return new Intl.NumberFormat(lsLang(), { minimumFractionDigits: k, maximumFractionDigits: k }).format(n); } catch (e) { return Number(n).toFixed(k); } };
const lsPlain = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[œæßøłđıþð]/g, c => LS_MAPC[c]).replace(/&/g, ' and ');
function lsNorm(s, drop) {
  let t = lsPlain(s).split(/[^a-z0-9]+/).filter(Boolean).map(w => LS_SYN[w] || w);
  while (t.length > 1 && LS_ART.has(t[0])) t.shift();
  if (drop && drop.size) { const u = t.filter(w => !drop.has(w)); if (u.length) t = u; }
  return t.join('').replace(/ph/g, 'f');
}
const lsSlug = s => lsPlain(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
const lsRude = s => LS_RUDE.test(lsPlain(String(s == null ? '' : s).replace(/[013457@$]/g, c => LS_LEET[c] || c)));
function lsHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function lsRng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function lsShuffle(a, R) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

const LS_SETC = new Map();
function lsSet(id) {
  let s = LS_SETC.get(id);
  if (s) return s;
  const raw = LS_SETS[id];
  if (!raw) return null;
  const drop = new Set(raw.d), keys = new Map();
  const rows = raw.e.split('\n').map((ln, i) => {
    const p = ln.split('|'), en = p[1].split('/'), fr = p[2] ? p[2].split('/') : [];
    const r = { i, f: +p[0], w: Math.pow(2, +p[0]), en, fr, tags: p[3] ? p[3].split(' ') : [], k: lsSlug(en[0]), names: [] };
    en.forEach(n => r.names.push({ n, fr: false, k: lsNorm(n, drop) }));
    fr.forEach(n => r.names.push({ n, fr: true, k: lsNorm(n, drop) }));
    r.names.forEach(x => { if (!keys.has(x.k)) keys.set(x.k, r); });
    return r;
  });
  const bySlug = new Map(rows.map(r => [r.k, r]));
  s = { id, drop, z: raw.z, rows, keys, bySlug };
  LS_SETC.set(id, s);
  return s;
}
function lsFilter(set, flt, letter) {
  let suf = '';
  if (flt.includes('~')) { const a = flt.split('~'); flt = a[0]; suf = a[1]; }
  const alts = flt && flt !== '*' ? flt.split(',').map(a => a.split('+').filter(Boolean)) : null;
  const lx = letter ? letter.toLowerCase() : '';
  return set.rows.filter(r => {
    if (r.tags.includes('no')) return false;
    if (alts && !alts.some(need => need.every(x => x[0] === '!' ? !r.tags.includes(x.slice(1)) : r.tags.includes(x)))) return false;
    if (lx && !r.names.some(x => x.k[0] === lx)) return false;
    if (suf && !r.names.some(x => lsPlain(x.n).endsWith(suf))) return false;
    return true;
  });
}

const LS_PC = new Map();
const LS_PROMPT_BY = new Map(LS_PROMPTS.map(p => [p[0], p]));
function lsPromptRaw(id) { return LS_PROMPT_BY.get(id) || null; }
function lsVariant(raw, lang) {
  const v = {};
  raw[3].split(';').forEach(part => { const i = part.indexOf('='); if (i > 0) v[part.slice(0, i)] = part.slice(i + 1); else v['*'] = part; });
  if (v[lang]) return [lang, v[lang]];
  if (v['*']) return ['*', v['*']];
  return ['en', v.en || Object.values(v)[0]];
}
function lsPrompt(id, lang) {
  const raw = lsPromptRaw(id);
  if (!raw) return null;
  const [vl, src] = lsVariant(raw, lang || lsLang());
  const ck = id + '|' + vl;
  let P = LS_PC.get(ck);
  if (P) return P;
  const ci = src.indexOf(':'), set = lsSet(ci < 0 ? src : src.slice(0, ci));
  if (!set) return null;
  const x = raw[5] || '', lx = x.toLowerCase();
  const rows = lsFilter(set, ci < 0 ? '' : src.slice(ci + 1), x);
  const keys = new Map(), stems = new Map(), list = [];
  let sum = 0;
  rows.forEach(r => {
    sum += r.w;
    r.names.forEach(nm => {
      if (lx && nm.k[0] !== lx) return;
      if (!keys.has(nm.k)) { keys.set(nm.k, r); list.push(nm.k, r); }
    });
  });
  keys.forEach((r, k) => {
    if (k.length > 4 && k.endsWith('es') && !keys.has(k.slice(0, -2))) stems.set(k.slice(0, -2), r);
    if (k.length > 3 && /[sx]$/.test(k) && !keys.has(k.slice(0, -1))) stems.set(k.slice(0, -1), r);
  });
  const multi = raw[3].includes('=');
  P = { id, ck, vl, fam: raw[1], fl: raw[2], text: raw[4], x, set, rows, keys, stems, list, sum, multi, sorted: rows.slice().sort((a, b) => b.w - a.w || a.i - b.i) };
  LS_PC.set(ck, P);
  return P;
}
const lsPromptText = P => P.x ? T(P.text, { x: P.x }) : T(P.text);
function lsName(P, r, lang) {
  const fr = (lang || lsLang()) === 'fr' && r.fr.length;
  const first = fr ? r.fr[0] : r.en[0];
  if (!P || !P.x) return first;
  const lx = P.x.toLowerCase(), set = P.set;
  if (lsNorm(first, set.drop)[0] === lx) return first;
  const alt = (fr ? r.fr.concat(r.en) : r.en.concat(r.fr)).find(n => lsNorm(n, set.drop)[0] === lx);
  return alt || first;
}
function lsOsa(a, b, max) {
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > max) return max + 1;
  const W = lb + 1, d = lsOsa.buf || (lsOsa.buf = new Int16Array(3 * 64));
  if (W > 64) return max + 1;
  let p2 = 0, p1 = W, c = 2 * W;
  for (let j = 0; j <= lb; j++) d[p1 + j] = j;
  for (let i = 1; i <= la; i++) {
    d[c] = i;
    let best = i;
    for (let j = 1; j <= lb; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      let v = Math.min(d[p1 + j] + 1, d[c + j - 1] + 1, d[p1 + j - 1] + cost);
      if (i > 1 && j > 1 && a.charCodeAt(i - 1) === b.charCodeAt(j - 2) && a.charCodeAt(i - 2) === b.charCodeAt(j - 1)) v = Math.min(v, d[p2 + j - 2] + 1);
      d[c + j] = v;
      if (v < best) best = v;
    }
    if (best > max) return max + 1;
    const t = p2; p2 = p1; p1 = c; c = t;
  }
  return d[p1 + lb];
}
const lsTol = (len, z) => z <= 0 ? 0 : z >= 2 ? (len >= 8 ? 2 : len >= 4 ? 1 : 0) : (len >= 9 ? 2 : len >= 5 ? 1 : 0);
const LS_ALL = { keys: new Set(), todo: null };
function lsAllStep() {
  if (!LS_ALL.todo) LS_ALL.todo = Object.keys(LS_SETS);
  const id = LS_ALL.todo.shift();
  if (!id) return false;
  lsSet(id).rows.forEach(r => r.names.forEach(x => { LS_ALL.keys.add(lsNorm(x.n)); LS_ALL.keys.add(x.k); }));
  return LS_ALL.todo.length > 0;
}
function lsAll() { while (lsAllStep()) {} return LS_ALL.keys; }
function lsMatch(P, text) {
  const t = String(text == null ? '' : text).trim();
  if (!t) return { ok: false, why: 'empty' };
  const k = lsNorm(t, P.set.drop);
  if (!k) return { ok: false, why: 'none' };
  const cands = [k];
  if (k.length > 4 && k.endsWith('es')) cands.push(k.slice(0, -2));
  if (k.length > 3 && /[sx]$/.test(k)) cands.push(k.slice(0, -1));
  if (k.length > 4 && k.endsWith('ies')) cands.push(k.slice(0, -3) + 'y');
  for (const c of cands) {
    const r = P.keys.get(c) || P.stems.get(c);
    if (r) return { ok: true, row: r, exact: c === k };
  }
  if (lsRude(t)) return { ok: false, why: 'rude' };
  for (const c of cands) if (P.set.keys.has(c)) return { ok: false, why: 'fit' };
  const all = lsAll(), k0 = lsNorm(t);
  if (all.has(k0) || all.has(k)) return { ok: false, why: 'fit' };
  const tol = lsTol(k.length, P.set.z);
  if (tol > 0) {
    let best = null, bd = tol + 1;
    for (let i = 0; i < P.list.length; i += 2) {
      const key = P.list[i];
      if (key[0] !== k[0]) continue;
      const d = lsOsa(k, key, Math.min(tol, bd));
      if (d < bd || (d === bd && best && P.list[i + 1].w > best.w)) { bd = d; best = P.list[i + 1]; }
    }
    if (best && bd <= tol) return { ok: true, row: best, exact: false };
    for (const key of P.set.keys.keys()) if (key[0] === k[0] && lsOsa(k, key, tol) <= tol) return { ok: false, why: 'fit' };
  }
  return { ok: false, why: 'none' };
}
const lsSeedShare = (P, r) => P.sum > 0 ? r.w / P.sum : 0;
const lsShare = (P, r, live) => {
  const s = lsSeedShare(P, r);
  if (!live || !(live.t > 0)) return s;
  return Math.max(0, Math.min(1, (LS_K * s + Math.max(0, live.n)) / (LS_K + live.t)));
};
const lsTier = sh => { for (let i = 0; i < LS_TIERS.length; i++) if (sh >= LS_TIERS[i].min) return i; return LS_TIERS.length - 1; };
const lsPct = sh => sh >= .1 ? lsFmt(Math.round(sh * 100)) + '%' : sh >= .001 ? lsFmt(sh * 100, 1) + '%' : '<' + lsFmt(.1, 1) + '%';
function lsRare(P, n) {
  const R = lsRng(lsHash('rare:' + P.ck)), cut = P.sum * LS_TIERS[4].min, pool = P.rows.filter(r => r.w <= cut);
  return lsShuffle(pool.length >= n ? pool : P.sorted.slice(-Math.max(n, 6)), R).slice(0, n);
}

const lsDay = () => Math.max(0, Math.floor((Date.now() - LS_D0) / 864e5));
const lsNextDayMs = () => LS_D0 + (lsDay() + 1) * 864e5 - Date.now();
let LS_POOL = null;
function lsPool() {
  if (!LS_POOL) LS_POOL = LS_PROMPTS.filter(p => p[2].includes('d')).map(p => p[0]).sort();
  return LS_POOL;
}
const LS_DAYC = new Map();
function lsCycle(c) {
  const pool = lsPool(), L = Math.max(1, Math.floor(pool.length / LS_N)), R = lsRng(lsHash('long-shot-cycle:' + c));
  const fams = new Map();
  lsShuffle(pool.slice(), R).forEach(id => { const f = lsPromptRaw(id)[1]; if (!fams.has(f)) fams.set(f, []); fams.get(f).push(id); });
  const order = [...fams.values()].sort((a, b) => b.length - a.length);
  const days = Array.from({ length: L }, () => ({ ids: [], f: new Set() }));
  order.forEach(list => list.forEach(id => {
    const f = lsPromptRaw(id)[1];
    let best = null, bn = 99, br = 0;
    days.forEach(d => { if (d.ids.length >= LS_N || d.f.has(f)) return; const r = R(); if (d.ids.length < bn || (d.ids.length === bn && r < br)) { best = d; bn = d.ids.length; br = r; } });
    if (!best) days.forEach(d => { if (d.ids.length < LS_N && (!best || d.ids.length < best.ids.length)) best = d; });
    if (best) { best.ids.push(id); best.f.add(f); }
  }));
  return { L, days: days.map(d => lsShuffle(d.ids, R)) };
}
function lsDaily(d) {
  if (LS_DAYC.has(d)) return LS_DAYC.get(d);
  const L = Math.max(1, Math.floor(lsPool().length / LS_N)), c = Math.floor(d / L), cy = lsCycle(c);
  cy.days.forEach((ids, i) => LS_DAYC.set(c * L + i, ids));
  return LS_DAYC.get(d);
}
function lsRandomPrompts(n, seed, opt) {
  const o = opt || {}, R = lsRng(seed >>> 0), all = LS_PROMPTS.filter(p => (p[2].includes('d') || p[2].includes('e')) && !(o.solo === false && p[3].includes('='))).map(p => p[0]);
  const deck = lsShuffle(all.slice(), R), out = [], fams = [];
  const avoid = new Set(o.avoid || []);
  while (out.length < n && deck.length) {
    let j = deck.findIndex(id => !avoid.has(id) && !fams.slice(-3).includes(lsPromptRaw(id)[1]));
    if (j < 0) j = deck.findIndex(id => !avoid.has(id));
    if (j < 0) j = 0;
    const id = deck.splice(j, 1)[0];
    out.push(id); fams.push(lsPromptRaw(id)[1]);
  }
  return out;
}

const lsAuOf = pts => 1 + Math.max(0, pts) / 10;
function lsKm(pts) {
  const km = Math.max(0, pts) / 10 * LS_AU;
  if (km <= 0) return T('{n} km', { n: '0' });
  if (km < 1e9) return T('{n} million km', { n: lsFmt(Math.round(km / 1e6)) });
  return T('{n} billion km', { n: lsFmt(km / 1e9, 2) });
}
function lsZone(pts) {
  const au = lsAuOf(pts);
  let last = LS_BODIES[0], next = null;
  for (const b of LS_BODIES) { if (b.au <= au) last = b; else { next = b; break; } }
  return { last, next, au };
}
const lsAuTxt = au => T('{n} AU', { n: lsFmt(au, au < 10 ? 2 : 1) });

function lsBlank() { return { v: 1, days: {}, best: 0, endless: 0, eRuns: 0, rating: 1000, duel: { w: 0, l: 0, d: 0 }, rooms: { p: 0, w: 0 }, tiers: [0, 0, 0, 0, 0, 0, 0], bot: 1, room: { n: 7, s: 25, b: 1 } }; }
const lsInt = (v, lo, hi, d) => typeof v === 'number' && isFinite(v) ? Math.max(lo, Math.min(hi, Math.round(v))) : d;
function lsClean(raw) {
  const s = lsBlank();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return s;
  const today = lsDay();
  if (raw.days && typeof raw.days === 'object' && !Array.isArray(raw.days)) {
    const ks = Object.keys(raw.days).filter(k => /^\d{1,6}$/.test(k) && +k <= today + 1).sort((a, b) => b - a).slice(0, 400);
    ks.forEach(k => {
      const d = raw.days[k];
      if (!d || typeof d !== 'object' || !Array.isArray(d.a)) return;
      const a = d.a.slice(0, LS_N).map(x => Array.isArray(x) ? [typeof x[0] === 'string' && /^[a-z0-9-]{1,40}$/.test(x[0]) ? x[0] : '', lsInt(x[1], 0, 100, 0), lsInt(x[2], -1, 5, -1), lsInt(x[3], 0, 120000, 0), typeof x[4] === 'number' && isFinite(x[4]) ? Math.max(0, Math.min(1, x[4])) : 0, x[5] ? 1 : 0] : ['', 0, -1, 0, 0, 0]);
      const ids = Array.isArray(d.p) ? d.p.slice(0, LS_N).filter(x => typeof x === 'string' && x.length < 60) : [];
      s.days[k] = { a, p: ids.length === LS_N && ids.every(id => LS_PROMPT_BY.has(id)) ? ids : [], done: !!d.done && a.length >= LS_N, at: lsInt(d.at, 0, 4e12, 0) };
    });
  }
  s.best = lsInt(raw.best, 0, 700, 0);
  s.endless = lsInt(raw.endless, 0, 1e7, 0);
  s.eRuns = lsInt(raw.eRuns, 0, 1e7, 0);
  s.rating = lsInt(raw.rating, 100, 4000, 1000);
  if (raw.duel && typeof raw.duel === 'object') s.duel = { w: lsInt(raw.duel.w, 0, 1e6, 0), l: lsInt(raw.duel.l, 0, 1e6, 0), d: lsInt(raw.duel.d, 0, 1e6, 0) };
  if (raw.rooms && typeof raw.rooms === 'object') s.rooms = { p: lsInt(raw.rooms.p, 0, 1e6, 0), w: lsInt(raw.rooms.w, 0, 1e6, 0) };
  if (Array.isArray(raw.tiers) && raw.tiers.length === 7) s.tiers = raw.tiers.map(x => lsInt(x, 0, 1e7, 0));
  s.bot = lsInt(raw.bot, 0, 3, 1);
  if (raw.room && typeof raw.room === 'object') s.room = { n: [5, 7, 10, 15].includes(raw.room.n) ? raw.room.n : 7, s: [15, 20, 25, 30].includes(raw.room.s) ? raw.room.s : 25, b: lsInt(raw.room.b, 0, 3, 1) };
  return s;
}
function lsStreak(sv) {
  const t = lsDay();
  let d = sv.days[t] && sv.days[t].done ? t : t - 1, n = 0;
  while (sv.days[d] && sv.days[d].done) { n++; d--; }
  return n;
}
function lsBestStreak(sv) {
  const ks = Object.keys(sv.days).map(Number).filter(k => sv.days[k].done).sort((a, b) => a - b);
  let b = 0, c = 0, p = -9;
  ks.forEach(k => { c = k === p + 1 ? c + 1 : 1; p = k; if (c > b) b = c; });
  return b;
}
const lsDayPts = d => d ? d.a.reduce((s, x) => s + x[1], 0) : 0;
const LS_LOGK = 520;
const LS_VIS = [
  { b: 'Earth', au: 1, r: 26, dy: 70, c0: '#7fd0ff', c1: '#1f5fb8', c2: '#0a1f4a', land: '#3fae6a' },
  { b: 'Mars', au: 1.52, r: 15, dy: -95, c0: '#ffb08a', c1: '#c4502c', c2: '#4a1608' },
  { b: 'Jupiter', au: 5.2, r: 58, dy: -120, c0: '#f6dcb6', c1: '#c98d5a', c2: '#3a2414', bands: ['#e9c79c', '#b9784a', '#f3e3c6', '#a8663c', '#e2b98c'] },
  { b: 'Saturn', au: 9.58, r: 44, dy: 85, c0: '#fbe9bd', c1: '#d6b06c', c2: '#3c2c12', bands: ['#f1d9a2', '#c9a25c', '#f6e6bf'], ring: true },
  { b: 'Uranus', au: 19.2, r: 32, dy: -110, c0: '#d6fbff', c1: '#6fd2df', c2: '#0f3c48' },
  { b: 'Neptune', au: 30.07, r: 31, dy: 95, c0: '#9fc4ff', c1: '#2f5fe0', c2: '#08174d' },
  { b: 'Pluto', au: 39.5, r: 11, dy: -80, c0: '#f3dcc4', c1: '#b88b6a', c2: '#3a2618', heart: true },
  { b: 'Eris', au: 67.9, r: 10, dy: 70, c0: '#ffffff', c1: '#b7bcc8', c2: '#3c4050' }
];
function lsSprite(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
  draw(c.getContext('2d'), c.width, c.height);
  return c;
}
function lsPlanetSprite(v, k) {
  const r = v.r * k, pad = v.ring ? r * 1.25 : r * .35, w = (r + pad) * 2, h = v.ring ? r * 2.6 : w;
  return lsSprite(w, h, (g, W, H) => {
    const cx = W / 2, cy = H / 2;
    if (v.ring) {
      g.save(); g.translate(cx, cy); g.rotate(-.32); g.scale(1, .32);
      g.lineWidth = r * .22; g.strokeStyle = 'rgba(236,214,166,.55)'; g.beginPath(); g.arc(0, 0, r * 1.95, Math.PI, Math.PI * 2); g.stroke();
      g.lineWidth = r * .1; g.strokeStyle = 'rgba(255,240,205,.7)'; g.beginPath(); g.arc(0, 0, r * 1.62, Math.PI, Math.PI * 2); g.stroke();
      g.restore();
    }
    const glow = g.createRadialGradient(cx, cy, r * .9, cx, cy, r * 1.35);
    glow.addColorStop(0, 'rgba(160,200,255,.25)'); glow.addColorStop(1, 'rgba(160,200,255,0)');
    g.fillStyle = glow; g.beginPath(); g.arc(cx, cy, r * 1.35, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.clip();
    const body = g.createRadialGradient(cx - r * .45, cy - r * .5, r * .1, cx, cy, r * 1.05);
    body.addColorStop(0, v.c0); body.addColorStop(.55, v.c1); body.addColorStop(1, v.c2);
    g.fillStyle = body; g.fillRect(cx - r, cy - r, r * 2, r * 2);
    if (v.bands) {
      const n = 9;
      for (let i = 0; i < n; i++) {
        g.globalAlpha = .38; g.fillStyle = v.bands[i % v.bands.length];
        const y = cy - r + (i + .3) * (2 * r / n);
        g.beginPath(); g.ellipse(cx, y, r * 1.1, r / n * (.55 + .35 * Math.sin(i * 2.1)), 0, 0, Math.PI * 2); g.fill();
      }
      g.globalAlpha = 1;
      if (v.b === 'Jupiter') { g.fillStyle = 'rgba(190,90,60,.75)'; g.beginPath(); g.ellipse(cx + r * .32, cy + r * .28, r * .2, r * .11, 0, 0, Math.PI * 2); g.fill(); }
    }
    if (v.land) {
      g.fillStyle = v.land; g.globalAlpha = .85;
      [[-.35, -.15, .32, .22], [.2, .25, .28, .2], [.1, -.45, .2, .12], [-.1, .5, .18, .1]].forEach(([x, y, a, b]) => { g.beginPath(); g.ellipse(cx + x * r, cy + y * r, a * r, b * r, .4, 0, Math.PI * 2); g.fill(); });
      g.fillStyle = '#ffffff'; g.globalAlpha = .55;
      [[-.05, -.3, .5, .06], [.15, .05, .55, .05], [-.25, .35, .4, .05]].forEach(([x, y, a, b]) => { g.beginPath(); g.ellipse(cx + x * r, cy + y * r, a * r, b * r, -.2, 0, Math.PI * 2); g.fill(); });
      g.globalAlpha = 1;
    }
    if (v.heart) { g.fillStyle = 'rgba(255,240,225,.8)'; g.beginPath(); g.ellipse(cx + r * .15, cy + r * .2, r * .38, r * .3, .3, 0, Math.PI * 2); g.fill(); }
    const shade = g.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    shade.addColorStop(0, 'rgba(0,0,0,0)'); shade.addColorStop(.55, 'rgba(0,0,0,.05)'); shade.addColorStop(1, 'rgba(0,0,10,.55)');
    g.fillStyle = shade; g.fillRect(cx - r, cy - r, r * 2, r * 2);
    g.restore();
    if (v.ring) {
      g.save(); g.translate(cx, cy); g.rotate(-.32); g.scale(1, .32);
      g.lineWidth = r * .22; g.strokeStyle = 'rgba(236,214,166,.75)'; g.beginPath(); g.arc(0, 0, r * 1.95, 0, Math.PI); g.stroke();
      g.lineWidth = r * .1; g.strokeStyle = 'rgba(255,240,205,.9)'; g.beginPath(); g.arc(0, 0, r * 1.62, 0, Math.PI); g.stroke();
      g.restore();
    }
  });
}
function lsProbeSprite(k) {
  return lsSprite(120 * k, 80 * k, (g) => {
    g.scale(k, k);
    g.translate(60, 40);
    g.fillStyle = '#26305a'; g.fillRect(-38, -3, 76, 6);
    const panel = (x) => {
      g.fillStyle = '#1c3c8c'; g.fillRect(x - 13, -34, 26, 22); g.fillRect(x - 13, 12, 26, 22);
      g.strokeStyle = '#7fb4ff'; g.lineWidth = 1;
      for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(x + i * 8.5, -34); g.lineTo(x + i * 8.5, -12); g.moveTo(x + i * 8.5, 12); g.lineTo(x + i * 8.5, 34); g.stroke(); }
      g.beginPath(); g.moveTo(x - 13, -23); g.lineTo(x + 13, -23); g.moveTo(x - 13, 23); g.lineTo(x + 13, 23); g.stroke();
      g.strokeStyle = '#c4d8ff'; g.lineWidth = 1.5; g.strokeRect(x - 13, -34, 26, 22); g.strokeRect(x - 13, 12, 26, 22);
      g.fillStyle = '#8a93b8'; g.fillRect(x - 1.5, -12, 3, 24);
    };
    panel(-4);
    const foil = g.createLinearGradient(0, -14, 0, 14);
    foil.addColorStop(0, '#ffe7a3'); foil.addColorStop(.45, '#e9b54a'); foil.addColorStop(1, '#8a5a1a');
    g.fillStyle = foil;
    g.beginPath(); g.moveTo(-14, -12); g.lineTo(12, -12); g.lineTo(18, -6); g.lineTo(18, 6); g.lineTo(12, 12); g.lineTo(-14, 12); g.lineTo(-18, 6); g.lineTo(-18, -6); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(80,46,10,.7)'; g.lineWidth = 1; g.stroke();
    g.strokeStyle = 'rgba(255,245,210,.55)'; g.beginPath(); g.moveTo(-10, -8); g.lineTo(8, -8); g.moveTo(-12, 0); g.lineTo(14, 0); g.stroke();
    g.fillStyle = '#3a4466'; g.fillRect(-24, -5, 7, 10);
    g.fillStyle = '#5c6890'; g.beginPath(); g.moveTo(-24, -6); g.lineTo(-31, -9); g.lineTo(-31, 9); g.lineTo(-24, 6); g.closePath(); g.fill();
    g.save(); g.translate(10, -14); g.rotate(-.55);
    const dish = g.createLinearGradient(-14, 0, 14, 0);
    dish.addColorStop(0, '#f4f7ff'); dish.addColorStop(1, '#9aa5c6');
    g.fillStyle = dish; g.beginPath(); g.ellipse(0, -8, 15, 6, 0, Math.PI, Math.PI * 2); g.lineTo(15, -8); g.fill();
    g.strokeStyle = '#d9e1f7'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -8); g.lineTo(0, -17); g.stroke();
    g.fillStyle = '#ff6b5a'; g.beginPath(); g.arc(0, -18, 2, 0, Math.PI * 2); g.fill();
    g.restore();
    g.strokeStyle = '#aab4d4'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(18, 2); g.lineTo(44, 10); g.stroke();
    g.fillStyle = '#d6dcf0'; g.beginPath(); g.arc(44, 10, 2.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#7ad7ff'; g.beginPath(); g.arc(4, 5, 2, 0, Math.PI * 2); g.fill();
  });
}
function lsFlameSprite(k) {
  return lsSprite(110 * k, 40 * k, (g, W, H) => {
    const cy = H / 2;
    const grd = g.createLinearGradient(W, 0, 0, 0);
    grd.addColorStop(0, 'rgba(255,255,240,1)'); grd.addColorStop(.18, 'rgba(255,224,120,.95)'); grd.addColorStop(.5, 'rgba(255,128,40,.7)'); grd.addColorStop(1, 'rgba(255,60,20,0)');
    g.fillStyle = grd;
    g.beginPath(); g.moveTo(W, cy - H * .28); g.quadraticCurveTo(W * .45, cy - H * .5, 0, cy); g.quadraticCurveTo(W * .45, cy + H * .5, W, cy + H * .28); g.closePath(); g.fill();
    const core = g.createLinearGradient(W, 0, W * .4, 0);
    core.addColorStop(0, 'rgba(255,255,255,1)'); core.addColorStop(1, 'rgba(160,220,255,0)');
    g.fillStyle = core; g.beginPath(); g.moveTo(W, cy - H * .13); g.quadraticCurveTo(W * .7, cy, W * .4, cy); g.quadraticCurveTo(W * .7, cy, W, cy + H * .13); g.closePath(); g.fill();
  });
}
function lsGlowSprite(k, col, r) {
  return lsSprite(r * 2 * k, r * 2 * k, (g, W) => {
    const R = W / 2, grd = g.createRadialGradient(R, R, 0, R, R, R);
    grd.addColorStop(0, col); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, W, W);
  });
}
function lsNebula(W, H, seed) {
  const R = lsRng(seed);
  return lsSprite(W, H, (g) => {
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#060a1c'); bg.addColorStop(.6, '#0b1130'); bg.addColorStop(1, '#120f2e');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const cols = ['rgba(120,70,220,', 'rgba(40,120,220,', 'rgba(220,80,160,', 'rgba(40,180,200,'];
    for (let i = 0; i < 7; i++) {
      const x = R() * W, y = R() * H, r = (.25 + R() * .4) * Math.max(W, H), c = cols[i % cols.length];
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, c + (.1 + R() * .08) + ')'); grd.addColorStop(1, c + '0)');
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
    }
    for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(255,255,255,' + (.08 + R() * .25) + ')'; g.fillRect(R() * W, R() * H, 1, 1); }
  });
}
function lsScene(cv) {
  const S = { cv, ctx: cv.getContext('2d'), W: 960, H: 600, k: 1, port: false, lnau: 0, lnT: 0, speed: 0, burn: 0, burnC: '#ffb347', flash: 0, ring: 0, ringC: '#fff', t: 0, acc: 0, shake: 0, best: 0, labels: null, lang: '', spr: null, neb: null, pmax: 130, quiet: false, idle: 0, dirty: true };
  const NS = 240, sx = new Float32Array(NS), sy = new Float32Array(NS), sl = new Uint8Array(NS), sz = new Float32Array(NS), sa = new Float32Array(NS);
  const R0 = lsRng(97);
  for (let i = 0; i < NS; i++) { sx[i] = R0(); sy[i] = R0(); sl[i] = i % 3; sz[i] = sl[i] === 2 ? 1.8 : sl[i] === 1 ? 1.25 : .8; sa[i] = .35 + R0() * .6; }
  const NB = 70, bx = new Float32Array(NB), by = new Float32Array(NB), br = new Float32Array(NB);
  for (let i = 0; i < NB; i++) { bx[i] = Math.log(2.1) + R0() * (Math.log(3.3) - Math.log(2.1)); by[i] = (R0() - .5) * 2; br[i] = 1 + R0() * 2.6; }
  const NK = 90, kx = new Float32Array(NK), ky = new Float32Array(NK), kr = new Float32Array(NK);
  for (let i = 0; i < NK; i++) { kx[i] = Math.log(30) + R0() * (Math.log(55) - Math.log(30)); ky[i] = (R0() - .5) * 2; kr[i] = .8 + R0() * 1.8; }
  const LAYER = [.12, .35, .8];
  function sprites() {
    const k = S.k;
    S.spr = { planets: LS_VIS.map(v => ({ v, c: lsPlanetSprite(v, k) })), probe: lsProbeSprite(k), flame: lsFlameSprite(k), sun: lsGlowSprite(k, 'rgba(255,220,140,.9)', 160), flash: lsGlowSprite(k, 'rgba(255,255,255,.95)', 90), rock: lsGlowSprite(k, 'rgba(200,190,170,1)', 4), ice: lsGlowSprite(k, 'rgba(190,230,255,1)', 4) };
    const nk = Math.min(k, 1.25);
    S.neb = lsNebula(Math.round(S.W * nk), Math.round(S.H * nk), 7);
    S.sprK = k;
  }
  S.resize = (W, H, k, port) => {
    const first = !S.spr, sized = W !== S.W || H !== S.H;
    S.W = W; S.H = H; S.k = k; S.port = port;
    cv.width = Math.round(W * k); cv.height = Math.round(H * k);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    clearTimeout(S.rt);
    if (first || sized) sprites();
    else if (Math.abs(k - S.sprK) > .2) S.rt = setTimeout(sprites, 300);
    S.dirty = true;
  };
  S.px = () => S.W * (S.port ? .36 : .3);
  S.py = () => S.port ? 300 + (S.H - 300) * .4 : S.H * .7;
  S.set = (pts, now) => { S.lnT = Math.log(lsAuOf(pts)); if (now) { S.lnau = S.lnT; S.speed = 0; } S.dirty = true; };
  S.boost = tier => {
    const tt = LS_TIERS[Math.max(0, Math.min(5, tier))];
    S.burn = Math.min(1.6, .55 + tier * .2); S.burnC = tt.c; S.ring = tier >= 4 ? 1 : 0; S.ringC = tt.c; S.flash = tier >= 5 ? 1 : 0; S.shake = tier >= 4 ? .6 : .2;
  };
  S.step = dt => {
    S.t += dt;
    const prev = S.lnau;
    S.lnau += (S.lnT - S.lnau) * (1 - Math.exp(-dt * 1.9));
    if (Math.abs(S.lnT - S.lnau) < 1e-5) S.lnau = S.lnT;
    const v = (S.lnau - prev) / Math.max(1e-4, dt);
    S.speed += (v - S.speed) * Math.min(1, dt * 8);
    S.burn = Math.max(0, S.burn - dt * .9);
    S.flash = Math.max(0, S.flash - dt * 1.6);
    S.ring = Math.max(0, S.ring - dt * .9);
    S.shake = Math.max(0, S.shake - dt * 1.5);
    const drift = 6 + S.speed * LS_LOGK;
    for (let i = 0; i < NS; i++) { sx[i] -= drift * LAYER[sl[i]] * dt / S.W; if (sx[i] < 0) sx[i] += 1; }
  };
  function label(txt, x, y, col) {
    const g = S.ctx;
    g.font = '700 12px system-ui, "Segoe UI", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
    g.fillStyle = 'rgba(5,8,25,.55)'; const w = g.measureText(txt).width + 12; g.fillRect(x - w / 2, y - 2, w, 17);
    g.fillStyle = col || 'rgba(225,232,255,.92)'; g.fillText(txt, x, y);
  }
  function curtain(au, col, txt, la, K, px, lb) {
    const g = S.ctx, H = S.H, x = px + (Math.log(au) - la) * K;
    if (x < -60 || x > S.W + 60) return;
    g.strokeStyle = col; g.lineWidth = 2; g.globalAlpha = .55; g.beginPath();
    for (let y = 0; y <= H; y += 12) { const xx = x + Math.sin(y * .04 + S.t * 1.4) * 10; if (y === 0) g.moveTo(xx, y); else g.lineTo(xx, y); }
    g.stroke(); g.globalAlpha = .12; g.lineWidth = 26; g.stroke(); g.globalAlpha = 1;
    if (lb) label(lb[txt] || txt, x, S.port ? 64 : 92, col);
  }
  S.draw = () => {
    const g = S.ctx, W = S.W, H = S.H, k = S.k, px = S.px(), py = S.py();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(S.neb, 0, 0, cv.width, cv.height);
    g.setTransform(k, 0, 0, k, 0, 0);
    const sh = S.shake > 0 ? S.shake * 3 : 0, ox = sh ? Math.sin(S.t * 71) * sh : 0, oy = sh ? Math.cos(S.t * 53) * sh : 0;
    g.translate(ox, oy);
    const streak = Math.min(90, S.speed * LS_LOGK * .06);
    g.fillStyle = '#ffffff';
    for (let L = 0; L < 3; L++) {
      g.globalAlpha = L === 0 ? .45 : L === 1 ? .7 : .95;
      if (streak > 2) {
        g.strokeStyle = '#dfe8ff'; g.lineWidth = L === 2 ? 1.5 : 1; g.beginPath();
        for (let i = 0; i < NS; i++) { if (sl[i] !== L) continue; const x = sx[i] * W, y = sy[i] * H; g.moveTo(x, y); g.lineTo(x + streak * LAYER[L] * 1.6, y); }
        g.stroke();
      } else {
        for (let i = 0; i < NS; i++) { if (sl[i] !== L) continue; const tw = .75 + .25 * Math.sin(S.t * (1.3 + i % 7) + i); g.globalAlpha = sa[i] * tw * (L === 0 ? .6 : 1); g.fillRect(sx[i] * W, sy[i] * H, sz[i], sz[i]); }
      }
    }
    g.globalAlpha = 1;
    const la = S.lnau, sp = S.spr, K = LS_LOGK * (S.port ? .75 : 1);
    const sunX = px + (Math.log(.32) - la) * K;
    if (sunX > -200) { g.globalAlpha = Math.max(0, Math.min(1, (sunX + 200) / 300)); g.drawImage(sp.sun, sunX - 160, py - 160 - 40, 320, 320); g.globalAlpha = 1; }
    const yS = S.port ? .8 : 1;
    for (let i = 0; i < NB; i++) { const x = px + (bx[i] - la) * K; if (x < -10 || x > W + 10) continue; g.drawImage(sp.rock, x - br[i], py + by[i] * 120 * yS - br[i], br[i] * 2, br[i] * 2); }
    for (let i = 0; i < NK; i++) { const x = px + (kx[i] - la) * K; if (x < -10 || x > W + 10) continue; g.drawImage(sp.ice, x - kr[i], py + ky[i] * 150 * yS - kr[i], kr[i] * 2, kr[i] * 2); }
    const lb = S.labels;
    for (let i = 0; i < sp.planets.length; i++) {
      const P = sp.planets[i], v = P.v, x = px + (Math.log(v.au) - la) * K, w = P.c.width / k, h = P.c.height / k;
      if (x + w / 2 < 0 || x - w / 2 > W) continue;
      const y = py + v.dy * yS;
      g.drawImage(P.c, x - w / 2, y - h / 2, w, h);
      if (lb) label(lb[v.b] || v.b, x, y + v.r + (v.ring ? 18 : 8));
    }
    curtain(94, '#7ad7ff', 'Termination shock', la, K, px, lb);
    curtain(121, '#c79bff', 'Heliopause', la, K, px, lb);
    const vx = px + (Math.log(167) - la) * K;
    if (vx > -40 && vx < W + 40) { g.save(); g.translate(vx, py - 70); g.scale(.4, .4); g.drawImage(sp.probe, -60, -40, 120, 80); g.restore(); if (lb) label(lb['Voyager 1'] || 'Voyager 1', vx, py - 50); }
    const fl = .75 + .25 * Math.sin(S.t * 38) + .1 * Math.sin(S.t * 23);
    const bob = Math.sin(S.t * 1.7) * 3, ang = Math.sin(S.t * .9) * .03;
    g.save(); g.translate(px, py + bob); g.rotate(ang);
    const bl = S.burn + Math.min(.5, S.speed * 3);
    if (bl > .02) {
      const L = (24 + 90 * Math.min(1.3, bl)) * fl, Hh = 18 + 10 * Math.min(1, bl);
      g.globalAlpha = Math.min(1, bl * 1.4);
      g.drawImage(sp.flame, -31 - L, -Hh / 2, L, Hh);
      g.globalAlpha = 1;
    } else {
      g.globalAlpha = .55 + .2 * Math.sin(S.t * 6); g.drawImage(sp.flame, -40, -4, 10, 8); g.globalAlpha = 1;
    }
    g.drawImage(sp.probe, -60, -40, 120, 80);
    g.restore();
    if (S.ring > 0) {
      const r = (1 - S.ring) * 180 + 20;
      g.strokeStyle = S.ringC; g.globalAlpha = S.ring * .8; g.lineWidth = 3 + S.ring * 6; g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    }
    if (S.flash > 0) { g.globalAlpha = S.flash; g.drawImage(sp.flash, px - 140, py - 140, 280, 280); g.globalAlpha = 1; }
    g.setTransform(k, 0, 0, k, 0, 0);
    if (!S.quiet) track();
    S.dirty = false;
  };
  function track() {
    const g = S.ctx, W = S.W, H = S.H, x0 = 22, x1 = W - 22, y = H - 20;
    const au = Math.exp(S.lnau), mx = au > 100 || S.pmax > 130 ? 2500 : 130, l0 = Math.log(.8), l1 = Math.log(mx);
    const X = a => x0 + (Math.log(Math.max(.8, Math.min(mx, a))) - l0) / (l1 - l0) * (x1 - x0);
    g.fillStyle = 'rgba(6,10,30,.55)'; g.fillRect(x0 - 10, y - 13, x1 - x0 + 20, 26);
    g.strokeStyle = 'rgba(160,180,255,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
    const xa = X(au);
    g.strokeStyle = '#ffb45a'; g.lineWidth = 3; g.beginPath(); g.moveTo(X(1), y); g.lineTo(xa, y); g.stroke();
    const lb = S.labels;
    let next = null;
    for (const b of LS_BODIES) {
      if (b.au < 1 || b.au > mx) continue;
      const x = X(b.au), passed = b.au <= au;
      g.fillStyle = passed ? '#ffd28a' : 'rgba(200,210,255,.55)';
      g.beginPath(); g.arc(x, y, b.n === 'Earth' ? 3.5 : 2.5, 0, Math.PI * 2); g.fill();
      if (!passed && !next) next = b;
    }
    if (S.best > 0) { const xb = X(lsAuOf(S.best)); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 2; g.beginPath(); g.moveTo(xb, y - 8); g.lineTo(xb, y + 8); g.stroke(); }
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(xa + 7, y); g.lineTo(xa - 4, y - 5); g.lineTo(xa - 4, y + 5); g.closePath(); g.fill();
    if (next && lb) {
      if (S.nextKey !== next.n + S.lang) { S.nextKey = next.n + S.lang; S.nextTxt = (lb.next || 'Next: {name}').replace('{name}', lb[next.n] || next.n); }
      g.font = '700 11px system-ui, "Segoe UI", sans-serif'; g.textBaseline = 'middle';
      const xn = X(next.au), tw = g.measureText(S.nextTxt).width;
      const al = xn + tw / 2 > x1 ? 'right' : xn - tw / 2 < x0 ? 'left' : 'center';
      g.textAlign = al; g.fillStyle = 'rgba(220,228,255,.9)';
      g.fillText(S.nextTxt, al === 'right' ? x1 : al === 'left' ? x0 : xn, y - 22);
    }
  }
  return S;
}
function lsCardCanvas(o) {
  const W = 1080, H = 1350, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d'), F = 'system-ui, "Segoe UI", Roboto, sans-serif';
  g.drawImage(lsNebula(W, H, 31 + (o.day || 0)), 0, 0);
  const R = lsRng(5);
  for (let i = 0; i < 180; i++) { g.fillStyle = 'rgba(255,255,255,' + (.3 + R() * .6) + ')'; const s = R() < .1 ? 3 : 1.6; g.fillRect(R() * W, R() * H, s, s); }
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.fillStyle = '#ffd28a'; g.font = '900 40px ' + F; g.fillText(o.kicker, W / 2, 120);
  g.fillStyle = '#ffffff'; g.font = '900 110px ' + F; g.fillText('LONG SHOT', W / 2, 235);
  g.fillStyle = 'rgba(220,228,255,.85)'; g.font = '700 38px ' + F; g.fillText(o.sub, W / 2, 300);
  const v = LS_VIS.slice().reverse().find(x => x.au <= lsAuOf(o.pts)) || LS_VIS[0];
  const pl = lsPlanetSprite(Object.assign({}, v, { r: 150 }), 1);
  g.drawImage(pl, W / 2 + 120 - pl.width / 2, 560 - pl.height / 2);
  g.save(); g.translate(W / 2 - 150, 600); g.scale(2.6, 2.6);
  g.drawImage(lsFlameSprite(1), -31 - 90, -12, 90, 24); g.drawImage(lsProbeSprite(1), -60, -40); g.restore();
  g.fillStyle = '#ffffff'; g.font = '900 96px ' + F; g.fillText(o.dist, W / 2, 860);
  g.fillStyle = '#ffd28a'; g.font = '800 44px ' + F; g.fillText(o.zone, W / 2, 925);
  const n = o.tiers.length, gap = 128, x0 = W / 2 - (n - 1) * gap / 2;
  o.tiers.forEach((t, i) => {
    const x = x0 + i * gap, y = 1050, tt = t >= 0 ? LS_TIERS[t] : LS_MISS;
    g.fillStyle = tt.c; g.globalAlpha = t >= 0 ? 1 : .55; g.beginPath(); g.arc(x, y, 46, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    g.fillStyle = t >= 0 ? '#0b1130' : '#ffffff'; g.font = '900 34px ' + F; g.fillText(t >= 0 ? String(tt.p) : '0', x, y + 12);
  });
  g.fillStyle = '#ffffff'; g.font = '900 64px ' + F; g.fillText(o.score, W / 2, 1185);
  g.fillStyle = 'rgba(220,228,255,.7)'; g.font = '700 32px ' + F; g.fillText('gameplaygames.web.app', W / 2, 1290);
  return c;
}
function lsSound(api) {
  let ac = null, mg = null, nb = null;
  const ctx = () => {
    if (api.muted) return null;
    try {
      if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); mg = ac.createGain(); mg.gain.value = .9; mg.connect(ac.destination); }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    } catch (e) { return null; }
  };
  const tone = (f, d, type, v, t0, f2) => {
    const c = ctx(); if (!c) return;
    const t = c.currentTime + (t0 || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v || .08, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(mg); o.start(t); o.stop(t + d + .05);
  };
  const noise = (d, v, f, t0, f2) => {
    const c = ctx(); if (!c) return;
    if (!nb) { const n = Math.floor(c.sampleRate * 1.5); nb = c.createBuffer(1, n, c.sampleRate); const a = nb.getChannelData(0); for (let i = 0; i < n; i++) a[i] = Math.random() * 2 - 1; }
    const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + (t0 || 0);
    s.buffer = nb; fl.type = 'lowpass'; fl.frequency.setValueAtTime(f || 900, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v || .12, t + .05); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(fl).connect(g).connect(mg); s.start(t); s.stop(t + d + .05);
  };
  const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5];
  return {
    tap() { tone(660, .05, 'triangle', .04); },
    key() { tone(1400 + Math.random() * 200, .018, 'square', .008); },
    tick(urgent) { tone(urgent ? 1180 : 880, .05, 'square', urgent ? .035 : .02); },
    count(go) { tone(go ? 988 : 659, go ? .22 : .12, 'triangle', .06); },
    no() { tone(196, .16, 'sawtooth', .045); tone(147, .2, 'sawtooth', .035, .07); },
    rude() { tone(130, .25, 'square', .04); },
    lock() { tone(740, .08, 'triangle', .06); tone(1110, .12, 'triangle', .05, .06); },
    tier(i) {
      const n = 2 + i;
      for (let k = 0; k < n; k++) tone(NOTES[Math.min(NOTES.length - 1, k + (i > 2 ? 1 : 0))], .22 + k * .02, 'triangle', .05, k * .075);
      if (i >= 5) { tone(2093, .6, 'sine', .04, n * .075); tone(1568, .7, 'sine', .03, n * .075 + .05); }
    },
    burn(i) { noise(.7 + i * .15, .1 + i * .02, 500, 0, 120); tone(70, .6 + i * .1, 'sine', .07, 0, 45); },
    miss() { tone(392, .18, 'triangle', .05); tone(311, .24, 'triangle', .045, .14); tone(233, .34, 'triangle', .04, .3); },
    pass() { tone(330, .14, 'triangle', .04); tone(262, .2, 'triangle', .035, .1); },
    milestone() { tone(1568, .4, 'sine', .035); tone(2093, .5, 'sine', .025, .08); },
    fanfare() { [523.25, 659.25, 783.99, 1046.5].forEach((f, k) => tone(f, .35, 'triangle', .055, k * .11)); tone(1046.5, .8, 'sine', .04, .5); },
    win() { [659.25, 783.99, 987.77, 1318.5].forEach((f, k) => tone(f, .3, 'square', .03, k * .1)); },
    lose() { [440, 392, 349.23, 293.66].forEach((f, k) => tone(f, .3, 'triangle', .045, k * .13)); },
    fuel() { tone(523.25, .12, 'sine', .05); tone(1046.5, .2, 'sine', .05, .1); },
    close() { try { if (ac) ac.close(); } catch (e) {} ac = null; }
  };
}
const LS_CSS = `
.gm-long-shot{gap:0;font-family:Nunito,"Segoe UI",system-ui,-apple-system,Roboto,sans-serif}
.gm-long-shot *{box-sizing:border-box}
.gm-long-shot [hidden]{display:none!important}
.gm-long-shot .ls{position:relative;overflow:hidden;border-radius:18px;margin:0 auto;max-width:100%;background:#070b1f;box-shadow:0 14px 40px -18px rgba(5,8,30,.8);touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.gm-long-shot .ls-st{position:absolute;left:0;top:0;transform-origin:0 0;overflow:hidden;color:#eef2ff}
.gm-long-shot .ls-cv{position:absolute;left:0;top:0;display:block}
.gm-long-shot .ls-hud{position:absolute;left:14px;right:14px;top:12px;height:40px;display:flex;align-items:center;gap:10px;z-index:5;pointer-events:none}
.gm-long-shot .ls-chip{flex:none;padding:7px 13px;border-radius:12px;background:rgba(10,14,40,.62);border:1px solid rgba(150,170,255,.22);font-weight:900;font-size:13px;letter-spacing:.02em;white-space:nowrap}
.gm-long-shot .ls-chip i{font-style:normal;color:#ffd28a}
.gm-long-shot .ls-dots{flex:1;display:flex;justify-content:center;gap:6px;min-width:0}
.gm-long-shot .ls-dots span{width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.2);display:grid;place-items:center;font-size:10px;font-weight:900;color:#0b1130}
.gm-long-shot .ls-dots span.on{border-color:#ffd28a;box-shadow:0 0 0 3px rgba(255,210,138,.25)}
.gm-long-shot .ls-dots span.fuel{width:26px;height:16px;border-radius:5px;background:linear-gradient(#7ad7ff,#2f7fd8);border-color:#bfe9ff}
.gm-long-shot .ls-dots span.fuel.out{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.18)}
.gm-long-shot .ls-score{flex:none;text-align:right;line-height:1.05;padding:5px 12px;border-radius:12px;background:rgba(10,14,40,.62);border:1px solid rgba(150,170,255,.22)}
.gm-long-shot .ls-score b{display:block;font-size:19px;font-weight:900}
.gm-long-shot .ls-score small{display:block;font-size:11.5px;font-weight:800;color:#ffd28a;white-space:nowrap}
.gm-long-shot .ls-q{position:absolute;left:50%;top:62px;width:660px;margin-left:-330px;z-index:6;padding:16px 20px 14px;border-radius:20px;background:linear-gradient(rgba(22,28,66,.9),rgba(12,16,44,.88));border:1px solid rgba(150,170,255,.28);box-shadow:0 18px 50px -20px rgba(0,0,0,.8);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.gm-long-shot .ls-q.in{animation:ls-in .35s cubic-bezier(.2,.9,.3,1.2)}
.gm-long-shot .ls-qk{display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#8fb6ff;margin-bottom:6px}
.gm-long-shot .ls-qt{font-size:31px;font-weight:900;line-height:1.15;letter-spacing:-.01em;min-height:36px;text-wrap:balance;transition:filter .2s}
.gm-long-shot .ls-st.paused .ls-qt,.gm-long-shot .ls-st.paused .ls-in{filter:blur(9px)}
.gm-long-shot .ls-tm{position:relative;height:10px;margin:12px 0 12px;border-radius:6px;background:rgba(255,255,255,.1);overflow:hidden}
.gm-long-shot .ls-tm i{position:absolute;left:0;top:0;bottom:0;width:100%;transform-origin:0 50%;border-radius:6px;background:linear-gradient(90deg,#7ad7ff,#ffb45a)}
.gm-long-shot .ls-tm.done{opacity:.35}
.gm-long-shot .ls-tm.low i{background:linear-gradient(90deg,#ff5d5d,#ff9a5a)}
.gm-long-shot .ls-secs{font-variant-numeric:tabular-nums;color:#fff;font-size:15px;letter-spacing:0}
.gm-long-shot .ls-secs.low{color:#ff8f8f;animation:ls-pulse .5s infinite alternate}
.gm-long-shot .ls-f{display:flex;gap:8px}
.gm-long-shot .ls-in{flex:1;min-width:0;height:52px;padding:0 16px;border-radius:14px;border:2px solid rgba(150,170,255,.35);background:rgba(4,7,24,.75);color:#fff;font-weight:800;font-size:22px;line-height:1;font-family:inherit;outline:none;transition:border-color .15s,box-shadow .15s}
.gm-long-shot .ls-in:focus{border-color:#7ad7ff;box-shadow:0 0 0 4px rgba(122,215,255,.18)}
.gm-long-shot .ls-in::placeholder{color:rgba(200,210,255,.45);font-weight:700}
.gm-long-shot .ls-in.shake{animation:ls-shake .32s;border-color:#ff6b6b}
.gm-long-shot .ls-in.locked{border-color:rgba(255,210,138,.5)}
.gm-long-shot .ls-go{flex:none;height:52px;padding:0 22px;border:0;border-radius:14px;background:linear-gradient(#ffc46b,#ff8a3d);color:#2a1300;font-weight:900;font-size:18px;line-height:1;font-family:inherit;cursor:pointer;box-shadow:0 4px 0 #b8541b}
.gm-long-shot .ls-go:active{transform:translateY(2px);box-shadow:0 2px 0 #b8541b}
.gm-long-shot .ls-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:9px;min-height:26px}
.gm-long-shot .ls-fb{flex:1;font-size:14.5px;font-weight:800;color:#c9d3ff;min-height:20px}
.gm-long-shot .ls-fb.bad{color:#ff9b9b}
.gm-long-shot .ls-pass{flex:none;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);color:#dfe5ff;border-radius:10px;padding:6px 12px;font-weight:800;font-size:13px;line-height:1;font-family:inherit;cursor:pointer}
.gm-long-shot .ls-pass:hover{background:rgba(255,255,255,.12)}
.gm-long-shot .ls-res{display:flex;align-items:center;gap:12px;min-height:50px;margin-top:9px;padding:6px 6px 6px 16px;border-radius:14px;background:rgba(4,7,24,.7);border:2px solid rgba(255,210,138,.45);animation:ls-in .3s}
.gm-long-shot .ls-res .nm{flex:1;min-width:0;font-size:22px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-long-shot .ls-res .pt{font-size:22px;font-weight:900;color:#ffd28a;min-width:64px;text-align:right;padding-right:10px}
.gm-long-shot .ls-res.miss{border-color:rgba(255,120,120,.4)}
.gm-long-shot .ls-res.miss .nm{color:#ffb0b0}
.gm-long-shot .ls-tier{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;font-weight:900;font-size:13px;color:#0b1130;white-space:nowrap}
.gm-long-shot .ls-tier small{font-weight:800;font-size:12px;opacity:.8}
.gm-long-shot .ls-tier.scan{background:rgba(255,255,255,.12)!important;color:#cfd8ff;animation:ls-pulse .35s infinite alternate}
.gm-long-shot .ls-lk{display:flex;gap:4px;flex-wrap:wrap;align-items:center;font-size:12px;font-weight:800;color:#c9d3ff}
.gm-long-shot .ls-lk i{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;font-style:normal;font-size:10px;font-weight:900;background:rgba(255,255,255,.12);color:#dfe5ff;border:2px solid transparent}
.gm-long-shot .ls-lk i.ok{background:#36d6a0;color:#06261b;border-color:#bdf5df}
.gm-long-shot .ls-opp{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;color:#dfe5ff}
.gm-long-shot .ls-opp .av{width:22px;height:22px;border-radius:50%;display:inline-grid;place-items:center;font-size:10px;font-weight:900;color:#fff}
.gm-long-shot .ls-pop{position:absolute;z-index:7;left:0;top:0;transform:translate(-50%,-50%);pointer-events:none;text-align:center;font-weight:900;white-space:nowrap;opacity:0}
.gm-long-shot .ls-pop.go{animation:ls-pop 1.6s ease-out forwards}
.gm-long-shot .ls-pop b{display:block;font-size:30px;text-shadow:0 3px 14px rgba(0,0,0,.6)}
.gm-long-shot .ls-pop span{display:block;font-size:20px;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.6)}
.gm-long-shot .ls-pane{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(4,6,20,.55)}
.gm-long-shot .ls-pane.clear{background:transparent;pointer-events:none}
.gm-long-shot .ls-pane.clear .ls-box,.gm-long-shot .ls-pane.clear .ls-rv{pointer-events:auto}
.gm-long-shot .ls-pane.low{align-items:flex-start;padding-bottom:40px}
.gm-long-shot .ls-box{width:100%;max-width:640px;max-height:100%;overflow:auto;overscroll-behavior:contain;padding:22px 24px 20px;border-radius:24px;background:linear-gradient(rgba(24,30,72,.96),rgba(12,16,46,.96));border:1px solid rgba(150,170,255,.3);box-shadow:0 24px 70px -20px rgba(0,0,0,.85);text-align:center;scrollbar-width:thin}
.gm-long-shot .ls-box.wide{max-width:780px}
.gm-long-shot .ls-box h2{margin:2px 0 4px;font-size:30px;font-weight:900;letter-spacing:-.01em}
.gm-long-shot .ls-box h3{margin:14px 0 6px;font-size:15px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#8fb6ff}
.gm-long-shot .ls-box p{margin:6px 0;font-size:15px;line-height:1.45;color:#d8def9}
.gm-long-shot .ls-kick{font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#ffd28a}
.gm-long-shot .ls-logo{display:flex;align-items:center;justify-content:center;gap:12px;margin:2px 0 6px}
.gm-long-shot .ls-logo b{font-size:44px;font-weight:900;letter-spacing:-.02em;line-height:1;background:linear-gradient(#fff,#ffd28a);-webkit-background-clip:text;background-clip:text;color:transparent}
.gm-long-shot .ls-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:100%;min-height:50px;margin:9px 0 0;padding:9px 16px;border:0;border-radius:15px;font-weight:900;font-size:17px;line-height:1.1;font-family:inherit;color:#fff;cursor:pointer;background:#3a4380;box-shadow:0 4px 0 rgba(0,0,0,.35)}
.gm-long-shot .ls-btn:hover{filter:brightness(1.1)}
.gm-long-shot .ls-btn:active{transform:translateY(2px);box-shadow:0 2px 0 rgba(0,0,0,.35)}
.gm-long-shot .ls-btn small{display:block;font-size:12.5px;font-weight:700;opacity:.85}
.gm-long-shot .ls-btn.hot{background:linear-gradient(#ffc46b,#ff8a3d);color:#2a1300;box-shadow:0 4px 0 #b8541b}
.gm-long-shot .ls-btn.blue{background:linear-gradient(#4aa8ff,#2f6fd8)}
.gm-long-shot .ls-btn.teal{background:linear-gradient(#36d6a0,#1f9c74);color:#04241a}
.gm-long-shot .ls-btn.vio{background:linear-gradient(#b77dff,#7d4fd6)}
.gm-long-shot .ls-btn.ghost{background:rgba(255,255,255,.08);box-shadow:none;border:1px solid rgba(255,255,255,.2);font-size:15px;min-height:42px}
.gm-long-shot .ls-btn:disabled{opacity:.45;pointer-events:none}
.gm-long-shot .ls-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-top:9px}
.gm-long-shot .ls-grid .ls-btn{margin:0}
.gm-long-shot .ls-pair{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:9px}
.gm-long-shot .ls-pair .ls-btn{margin:0}
.gm-long-shot .ls-stats{display:flex;justify-content:center;gap:8px;margin:12px 0 2px;flex-wrap:wrap}
.gm-long-shot .ls-stats div{min-width:92px;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)}
.gm-long-shot .ls-stats b{display:block;font-size:20px;font-weight:900}
.gm-long-shot .ls-stats span{display:block;font-size:11.5px;font-weight:800;color:#aab6e8;text-transform:uppercase;letter-spacing:.06em}
.gm-long-shot .ls-note{margin-top:12px;font-size:12.5px;font-weight:700;color:#98a4d6}
.gm-long-shot .ls-note i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:#ffb45a;vertical-align:1px}
.gm-long-shot .ls-note i.live{background:#36d6a0;box-shadow:0 0 0 3px rgba(54,214,160,.25)}
.gm-long-shot .ls-seg{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:6px 0}
.gm-long-shot .ls-seg button{min-width:52px;height:38px;padding:0 12px;border-radius:11px;border:2px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;font-weight:800;font-size:14px;line-height:1;font-family:inherit;cursor:pointer}
.gm-long-shot .ls-seg button.on{background:#ffd28a;border-color:#ffd28a;color:#22243f}
.gm-long-shot .ls-opt{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:8px 0;text-align:left}
.gm-long-shot .ls-opt>span{font-size:14px;font-weight:800;color:#e9ecff}
.gm-long-shot .ls-big{font-size:46px;font-weight:900;line-height:1.05;margin:6px 0 2px;letter-spacing:-.02em}
.gm-long-shot .ls-zone{font-size:17px;font-weight:900;color:#ffd28a}
.gm-long-shot .ls-sheet{margin:14px 0 4px;text-align:left;display:flex;flex-direction:column;gap:6px}
.gm-long-shot .ls-it{border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);overflow:hidden}
.gm-long-shot .ls-it>button{all:unset;box-sizing:border-box;display:grid;grid-template-columns:26px 1fr auto 52px;align-items:center;gap:10px;width:100%;padding:9px 12px;cursor:pointer}
.gm-long-shot .ls-it>button:focus-visible{outline:2px solid #7ad7ff;outline-offset:-2px}
.gm-long-shot .ls-it .n{font-size:12px;font-weight:900;color:#8fb6ff;text-align:center}
.gm-long-shot .ls-it .q{font-size:12.5px;font-weight:800;color:#aab6e8;line-height:1.2}
.gm-long-shot .ls-it .a{display:block;font-size:16px;font-weight:900;color:#fff;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-long-shot .ls-it .a.miss{color:#ff9b9b}
.gm-long-shot .ls-it .p{font-size:18px;font-weight:900;color:#ffd28a;text-align:right}
.gm-long-shot .ls-it .x{padding:0 12px 10px 48px;font-size:13px;color:#c9d3ff;line-height:1.45}
.gm-long-shot .ls-it .x b{color:#fff}
.gm-long-shot .ls-it .x em{font-style:normal;color:#ffd28a;font-weight:800}
.gm-long-shot .ls-rv{width:100%;max-width:560px;max-height:100%;overflow:auto;padding:16px 18px;border-radius:22px;background:linear-gradient(rgba(24,30,72,.95),rgba(12,16,46,.95));border:1px solid rgba(150,170,255,.3);box-shadow:0 24px 70px -20px rgba(0,0,0,.85);animation:ls-in .3s}
.gm-long-shot .ls-rv.two{max-width:860px}
.gm-long-shot .ls-rv.two .ls-list{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}
.gm-long-shot .ls-rvq{font-size:13px;font-weight:900;color:#8fb6ff;text-transform:uppercase;letter-spacing:.08em;text-align:center}
.gm-long-shot .ls-rvt{font-size:21px;font-weight:900;text-align:center;margin:2px 0 10px}
.gm-long-shot .ls-pl{display:grid;grid-template-columns:28px 1fr auto 46px 54px;align-items:center;gap:8px;padding:7px 10px;border-radius:12px;background:rgba(255,255,255,.05);margin-top:5px;animation:ls-in .3s both}
.gm-long-shot .ls-pl.me{background:rgba(255,210,138,.12);border:1px solid rgba(255,210,138,.35)}
.gm-long-shot .ls-pl .av{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:900;color:#fff}
.gm-long-shot .ls-pl .nm{min-width:0;overflow:hidden}
.gm-long-shot .ls-pl .nm b{display:block;font-size:14px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-long-shot .ls-pl .nm span{display:block;font-size:12.5px;font-weight:800;color:#c9d3ff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-long-shot .ls-pl .pt{font-size:16px;font-weight:900;color:#ffd28a;text-align:right}
.gm-long-shot .ls-pl .tot{font-size:16px;font-weight:900;text-align:right}
.gm-long-shot .ls-card{display:block;width:100%;max-width:300px;margin:8px auto 4px;border-radius:16px;box-shadow:0 12px 30px -10px rgba(0,0,0,.7)}
.gm-long-shot .ls-share{font-size:13px;font-weight:800;color:#c9d3ff;white-space:pre-line;margin:6px 0}
.gm-long-shot .ls-tl{display:flex;justify-content:center;gap:6px;margin:10px 0 4px;flex-wrap:wrap}
.gm-long-shot .ls-tl span{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:999px;font-size:12px;font-weight:900;color:#0b1130}
.gm-long-shot .ls-bars{display:flex;flex-direction:column;gap:4px;margin:8px auto 0;max-width:360px;text-align:left}
.gm-long-shot .ls-bars div{display:grid;grid-template-columns:96px 1fr 38px;align-items:center;gap:8px;font-size:12.5px;font-weight:800}
.gm-long-shot .ls-bars i{display:block;height:10px;border-radius:6px;min-width:3px}
.gm-long-shot .ls-st.port .ls-hud{left:8px;right:8px;top:8px;height:36px;gap:6px}
.gm-long-shot .ls-st.port .ls-chip{padding:6px 9px;font-size:12px}
.gm-long-shot .ls-st.port .ls-dots{gap:3px}
.gm-long-shot .ls-st.port .ls-dots span{width:17px;height:17px;font-size:8px}
.gm-long-shot .ls-st.port .ls-dots span.fuel{width:20px;height:13px}
.gm-long-shot .ls-st.port .ls-score{padding:4px 9px}
.gm-long-shot .ls-st.port .ls-score b{font-size:16px}
.gm-long-shot .ls-st.port .ls-score small{font-size:10.5px}
.gm-long-shot .ls-st.port .ls-q{left:8px;right:8px;width:auto;margin-left:0;top:52px;padding:12px 12px 10px;border-radius:18px}
.gm-long-shot .ls-st.port .ls-qt{font-size:25px}
.gm-long-shot .ls-st.port .ls-in{height:48px;font-size:19px;padding:0 12px}
.gm-long-shot .ls-st.port .ls-go{height:48px;padding:0 14px;font-size:16px}
.gm-long-shot .ls-st.port .ls-res .nm{font-size:18px}
.gm-long-shot .ls-st.port .ls-res .pt{font-size:18px;min-width:50px}
.gm-long-shot .ls-st.port .ls-pane{padding:10px;align-items:flex-start}
.gm-long-shot .ls-st.port .ls-box{padding:16px 14px 14px;border-radius:20px}
.gm-long-shot .ls-st.port .ls-box h2{font-size:25px}
.gm-long-shot .ls-st.port .ls-logo b{font-size:36px}
.gm-long-shot .ls-st.port .ls-grid{grid-template-columns:1fr}
.gm-long-shot .ls-st.port .ls-big{font-size:36px}
.gm-long-shot .ls-st.port .ls-it>button{grid-template-columns:20px 1fr auto 40px;gap:7px;padding:8px 9px}
.gm-long-shot .ls-st.port .ls-it .x{padding:0 10px 9px 36px}
.gm-long-shot .ls-st.port .ls-pl{grid-template-columns:24px 1fr auto 38px 44px;gap:6px;padding:6px 8px}
.gm-long-shot .ls-st.port .ls-pl .av{width:24px;height:24px}
.gm-long-shot .ls-st.port .ls-tier{padding:4px 8px;font-size:11.5px}
.gm-long-shot .ls-st.port .ls-rv{padding:12px}
@keyframes ls-in{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}
.gm-long-shot .ls-q.in{animation-name:ls-qin}
@keyframes ls-qin{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}
@keyframes ls-pulse{from{opacity:1}to{opacity:.55}}
@keyframes ls-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(3px)}}
@keyframes ls-pop{0%{opacity:0;transform:translate(-50%,-30%) scale(.6)}15%{opacity:1;transform:translate(-50%,-60%) scale(1.12)}30%{transform:translate(-50%,-65%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-120%) scale(1)}}
@media (prefers-reduced-motion:reduce){.gm-long-shot .ls-q.in,.gm-long-shot .ls-res,.gm-long-shot .ls-pl,.gm-long-shot .ls-rv{animation:none}}
`;
const LS_ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="46" cy="18" r="9"/><path d="M8 50c10-4 18-10 26-18"/><path d="M20 44l-8 8M26 40l-4 12M28 36l12-4"/><circle cx="16" cy="12" r="1.5"/><circle cx="54" cy="44" r="1.5"/><circle cx="34" cy="54" r="1.5"/></svg>';
const lsTierPill = (t, sh) => t < 0 ? `<span class="ls-tier" style="background:${LS_MISS.c};color:#fff">${lsEsc(T(LS_MISS.n))}</span>` : `<span class="ls-tier" style="background:${LS_TIERS[t].c}">${lsEsc(T(LS_TIERS[t].n))}${sh != null ? ` <small>${lsEsc(lsPct(sh))}</small>` : ''}</span>`;
const LS_AVC = ['#ff7a59', '#4aa8ff', '#36d6a0', '#b77dff', '#ffb45a', '#ff5d8f', '#2ec4d6', '#9ccc3c', '#f06292', '#7986cb', '#ffa726', '#26a69a', '#ab47bc', '#ef5350', '#5c6bc0', '#66bb6a'];
const lsAv = (name, i) => `<span class="av" style="background:${LS_AVC[i % LS_AVC.length]}">${lsEsc(String(name || '?').replace(/^Bot\s+/, '').slice(0, 1).toUpperCase())}</span>`;
function lsBuild(G) {
  const root = G.root, wrap = document.createElement('div'), st = document.createElement('div'), cv = document.createElement('canvas');
  wrap.className = 'ls'; st.className = 'ls-st'; cv.className = 'ls-cv';
  st.append(cv);
  st.insertAdjacentHTML('beforeend', `
<div class="ls-hud" data-r="hud" hidden><div class="ls-chip" data-r="chip"></div><div class="ls-dots" data-r="dots"></div><div class="ls-score"><b data-r="pts">0</b><small data-r="dist"></small></div></div>
<div class="ls-q" data-r="q" hidden>
 <div class="ls-qk"><span data-r="qk"></span><span class="ls-secs" data-r="secs"></span></div>
 <div class="ls-qt" data-r="qt"></div>
 <div class="ls-tm" data-r="tm"><i data-r="bar"></i></div>
 <form class="ls-f" data-r="form" autocomplete="off"><input class="ls-in" data-r="in" type="text" maxlength="48" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" aria-label=""><button class="ls-go" type="submit" data-r="go"></button></form>
 <div class="ls-res" data-r="res" hidden></div>
 <div class="ls-row"><div class="ls-fb" data-r="fb" aria-live="polite"></div><div class="ls-lk" data-r="lk" hidden></div><button class="ls-pass" type="button" data-act="pass" data-r="pass"></button></div>
</div>
<div class="ls-pop" data-r="pop"></div>
<div class="ls-pane" data-r="pane" hidden></div>`);
  wrap.append(st); root.append(wrap);
  G.wrap = wrap; G.st = st; G.cv = cv;
  const q = n => st.querySelector('[data-r="' + n + '"]');
  ['hud', 'chip', 'dots', 'pts', 'dist', 'q', 'qk', 'secs', 'qt', 'tm', 'bar', 'form', 'in', 'go', 'res', 'fb', 'lk', 'pass', 'pop', 'pane'].forEach(n => { G['$' + n] = q(n); });
  G.scene = lsScene(cv);
}
function lsTexts(G) {
  G.$go.textContent = T('Launch');
  G.$pass.textContent = T('Pass');
  G.$in.placeholder = T('Type your answer…');
  G.$in.setAttribute('aria-label', T('Your answer'));
  const L = {};
  LS_BODIES.forEach(b => { L[b.n] = T(b.n); });
  ['Termination shock', 'Heliopause', 'Voyager 1'].forEach(n => { L[n] = T(n); });
  L.next = T('Next: {name}');
  G.scene.labels = L; G.scene.lang = lsLang(); G.scene.nextKey = '';
}
function lsFit(G, force) {
  const rw = G.root.clientWidth || 800, port = rw < 640;
  let sh = 600;
  if (port) {
    let goff = 250;
    try { const v = parseFloat(getComputedStyle(G.wrap).getPropertyValue('--goff')); if (isFinite(v) && v >= 0) goff = v; } catch (e) {}
    const ah = Math.max(300, (window.innerHeight || 700) - goff);
    sh = Math.max(500, Math.min(720, Math.round(400 * ah / Math.max(260, rw) / 10) * 10));
  }
  if (force || port !== G.port || sh !== G.SH) {
    G.port = port; G.SW = port ? 400 : 960; G.SH = sh;
    G.wrap.style.width = `min(100%, ${G.SW}px, calc((100dvh - var(--goff, 250px)) * ${(G.SW / G.SH).toFixed(4)}))`;
    G.wrap.style.aspectRatio = `${G.SW} / ${G.SH}`;
    G.st.style.width = G.SW + 'px'; G.st.style.height = G.SH + 'px';
    G.st.classList.toggle('port', port);
  }
  const w = G.wrap.clientWidth || G.SW, s = w / G.SW;
  G.st.style.transform = `scale(${s})`;
  let vis = s;
  try { const r = G.wrap.getBoundingClientRect(); if (r.width > 0) vis = r.width / G.SW; } catch (e) {}
  const k = Math.max(1, Math.min(3, vis * (window.devicePixelRatio || 1)));
  if (force || Math.abs(k - G.scene.k) > .05 || G.scene.W !== G.SW || G.scene.H !== G.SH || G.scene.port !== port) G.scene.resize(G.SW, G.SH, k, port);
  G.scale = s;
}
function lsPane(G, html, opt) {
  const p = G.$pane, o = opt || {};
  p.className = 'ls-pane' + (o.clear ? ' clear' : '') + (o.low ? ' low' : '');
  p.style.paddingTop = o.low && !G.$q.hidden ? (G.$q.offsetTop + G.$q.offsetHeight + 8) + 'px' : '';
  p.innerHTML = html;
  p.hidden = false;
  p.scrollTop = 0;
  const b = p.querySelector('.ls-box,.ls-rv');
  if (b) b.scrollTop = 0;
  G.paneKey = o.key || '';
  if (!o.keep && !('ontouchstart' in window)) { const f = p.querySelector('[data-focus]'); if (f) setTimeout(() => { if (G.alive && f.isConnected) f.focus({ preventScroll: true }); }, 40); }
}
function lsHidePane(G) { G.$pane.hidden = true; G.$pane.innerHTML = ''; G.paneKey = ''; }
const lsSeg = (key, list, cur) => `<div class="ls-seg">${list.map(([v, l]) => `<button type="button" data-act="set" data-k="${key}" data-v="${v}" class="${String(v) === String(cur) ? 'on' : ''}">${lsEsc(l)}</button>`).join('')}</div>`;
const lsLiveNote = () => LS_LIVE.st === 'live' ? `<div class="ls-note"><i class="live"></i>${lsEsc(T('Live rarity from every player’s answers'))}</div>` : `<div class="ls-note"><i></i>${lsEsc(T('Rarity from our answer lists. Live counts are offline.'))}</div>`;
const LS_LIVE = { st: 'unknown', stats: new Map(), seen: new Map() };
const lsSrvKey = P => P.multi ? P.id + '.' + P.vl : P.id;
function lsBridge() { const a = window.Ameplay && Ameplay.account; return a && typeof a.rpc === 'function' && a.signedIn ? a : null; }
function lsRpc(fn, args) {
  const a = lsBridge();
  if (!a || LS_LIVE.st === 'off') return Promise.resolve(null);
  let p;
  try { p = Promise.resolve(a.rpc(fn, args)); } catch (e) { p = Promise.reject(e); }
  return p.then(r => r, e => {
    const m = String(e && e.message || '');
    if (e && (e.status === 404 || e.code === 'PGRST202' || e.code === '42883' || /could not find the function|does not exist/i.test(m))) LS_LIVE.st = 'off';
    return null;
  });
}
const lsNum = v => typeof v === 'number' && isFinite(v) && v >= 0 ? Math.floor(v) : -1;
function lsRecord(P, r) {
  const key = lsSrvKey(P) + '|' + r.k;
  if (LS_LIVE.seen.has(key)) return Promise.resolve(LS_LIVE.seen.get(key));
  return lsRpc('long_shot_answer', { p_prompt: lsSrvKey(P), p_answer: r.k }).then(x => {
    if (!x || typeof x !== 'object') return null;
    const n = lsNum(x.n), t = lsNum(x.t);
    if (n < 0 || t < 1 || n > t) return null;
    LS_LIVE.st = 'live';
    const v = { n, t };
    LS_LIVE.seen.set(key, v);
    return v;
  });
}
function lsFetchStats(Ps) {
  const want = Ps.filter(P => !LS_LIVE.stats.has(lsSrvKey(P))).map(lsSrvKey).slice(0, 10);
  if (!want.length) return Promise.resolve(true);
  return lsRpc('long_shot_stats', { p_prompts: want }).then(x => {
    if (!Array.isArray(x)) return false;
    x.slice(0, 10).forEach(o => {
      if (!o || typeof o.p !== 'string' || !want.includes(o.p)) return;
      const t = lsNum(o.t), a = Array.isArray(o.a) ? o.a.filter(e => Array.isArray(e) && typeof e[0] === 'string' && lsNum(e[1]) > 0).slice(0, 40).map(e => [e[0], lsNum(e[1])]) : [];
      if (t >= 0) LS_LIVE.stats.set(o.p, { t, a, m: new Map(a) });
    });
    LS_LIVE.st = 'live';
    return true;
  });
}
function lsLiveOf(P, r) {
  const s = LS_LIVE.stats.get(lsSrvKey(P));
  if (s && s.t > 0) return { n: s.m.get(r.k) || 0, t: s.t };
  return null;
}
function lsTop(P, n) {
  const s = LS_LIVE.stats.get(lsSrvKey(P));
  if (s && s.t >= LS_K) {
    const out = [];
    s.a.forEach(([k, c]) => { const r = P.set.bySlug.get(k); if (r && P.rows.includes(r) && out.length < n) out.push([r, lsShare(P, r, { n: c, t: s.t })]); });
    if (out.length >= Math.min(n, 2)) return out;
  }
  return P.sorted.slice(0, n).map(r => [r, lsShare(P, r, lsLiveOf(P, r))]);
}
const LS_BOTS = [
  { n: 'Easy', miss: .3, pow: 1.15, t0: 6, t1: 18, r: 800 },
  { n: 'Medium', miss: .15, pow: .7, t0: 4.5, t1: 14, r: 1000 },
  { n: 'Hard', miss: .07, pow: .3, t0: 3.5, t1: 10, r: 1250 },
  { n: 'Hardest', miss: .02, pow: -.8, t0: 2.5, t1: 7, r: 1550 }
];
const LS_BOTN = ['Nova', 'Orbit', 'Pulsar', 'Quasar', 'Vega', 'Lyra', 'Atlas', 'Cosmo', 'Halley', 'Kepler', 'Juno', 'Rigel', 'Sirius', 'Titan', 'Zenith'];
function lsBotPick(P, lvl, R) {
  const b = LS_BOTS[lvl] || LS_BOTS[1];
  if (R() < b.miss) return null;
  let sum = 0;
  const w = P.rows.map(r => { const v = Math.pow(lsSeedShare(P, r), b.pow); sum += v; return v; });
  let x = R() * sum;
  for (let i = 0; i < w.length; i++) { x -= w[i]; if (x <= 0) return P.rows[i]; }
  return P.rows[P.rows.length - 1];
}
const lsBotTime = (lvl, secs, R) => { const b = LS_BOTS[lvl] || LS_BOTS[1], f = secs / 25; return (b.t0 + (b.t1 - b.t0) * Math.pow(R(), 1.3)) * f; };
function lsElo(me, opp, res, k) { const e = 1 / (1 + Math.pow(10, (opp - me) / 400)); return Math.round(k * (res - e)); }
const lsDate = d => { try { return new Intl.DateTimeFormat(lsLang(), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(LS_D0 + d * 864e5)); } catch (e) { return ''; } };
const lsDur = ms => { const m = Math.max(1, Math.ceil(ms / 6e4)), h = Math.floor(m / 60); return h ? T('{h} h {m} min', { h, m: m % 60 }) : T('{m} min', { m }); };

function lsSave(G) { G.api.save(G.sv); }
function lsHud(G, on) {
  G.$hud.hidden = !on;
  if (!on) return;
  const R = G.R;
  if (!R) return;
  G.$chip.innerHTML = R.mode === 'daily' ? lsEsc(T('Daily #{n}', { n: R.day + 1 })) : R.mode === 'endless' ? lsEsc(T('Endless')) : R.mode === 'room' ? lsEsc(T('Live room')) : lsEsc(T('Duel'));
  if (R.mode === 'endless') G.$dots.innerHTML = [0, 1, 2].map(i => `<span class="fuel${i < R.lives ? '' : ' out'}" title="${lsEsc(T('Fuel'))}"></span>`).join('');
  else {
    const n = R.n;
    let h = '';
    for (let i = 0; i < n; i++) { const t = R.tiers[i]; h += `<span class="${i === R.i && R.phase !== 'end' ? 'on' : ''}" style="${t != null && t >= 0 ? 'background:' + LS_TIERS[t].c + ';border-color:' + LS_TIERS[t].c : t === -1 ? 'background:' + LS_MISS.c : ''}"></span>`; }
    G.$dots.innerHTML = h;
  }
  G.$pts.textContent = T('{n} pts', { n: lsFmt(R.pts) });
  G.$dist.textContent = lsKm(R.pts);
  G.api.score(R.pts);
}
function lsFeedback(G, why) {
  const t = { none: 'Not on our list. Try another answer!', fit: 'That’s real, but it doesn’t fit this prompt.', rude: 'Keep it friendly.', empty: 'Type an answer first.', host: 'Not accepted. Try another answer.' }[why] || '';
  G.$fb.textContent = T(t); G.$fb.className = 'ls-fb bad';
  if (why !== 'empty') { G.$in.classList.remove('shake'); void G.$in.offsetWidth; G.$in.classList.add('shake'); }
  if (why === 'rude') { G.$in.value = ''; G.snd.rude(); } else G.snd.no();
}
function lsShowQ(G, P, idx, n, secs) {
  G.$q.hidden = false;
  G.$q.classList.remove('in'); void G.$q.offsetWidth; G.$q.classList.add('in');
  G.$qk.textContent = n ? T('Prompt {i} of {n}', { i: idx + 1, n }) : T('Prompt {i}', { i: idx + 1 });
  G.$qt.textContent = lsPromptText(P);
  G.$res.hidden = true; G.$res.innerHTML = '';
  G.$form.hidden = false; G.$in.value = ''; G.$in.classList.remove('locked', 'shake'); G.$in.placeholder = T('Type your answer…');
  G.$fb.textContent = ''; G.$fb.className = 'ls-fb';
  G.$pass.hidden = false; G.$lk.hidden = true;
  G.$bar.style.transform = 'scaleX(1)'; G.$tm.classList.remove('low', 'done'); G.$secs.classList.remove('low'); G.$secs.textContent = String(secs);
  G.lastSec = secs;
  if (G.$pane.hidden || G.paneKey === 'rv') G.$in.focus({ preventScroll: true });
}
function lsTimerUI(G, left, secs) {
  const f = Math.max(0, Math.min(1, left / secs));
  G.$bar.style.transform = 'scaleX(' + f.toFixed(4) + ')';
  const s = Math.max(0, Math.ceil(left - 1e-6));
  if (s !== G.lastSec) {
    G.lastSec = s; G.$secs.textContent = String(s);
    const low = s <= 5;
    G.$tm.classList.toggle('low', low); G.$secs.classList.toggle('low', low);
    if (low && s > 0) G.snd.tick(s <= 3);
  }
}
function lsResCard(G, P, r, t, sh, pts, opt) {
  const o = opt || {};
  G.$pass.hidden = true;
  G.$in.value = ''; G.$in.classList.add('locked');
  G.$in.placeholder = G.port ? T('Locked in') : G.online || (G.R && G.R.bot) ? T('Locked in. Waiting for the others…') : T('Locked in. Press Enter to continue.');
  G.$tm.classList.add('done');
  G.$res.hidden = false;
  G.$res.className = 'ls-res' + (r ? '' : ' miss');
  if (!r) { G.$res.innerHTML = `<div class="nm">${lsEsc(T(o.why === 'pass' ? 'Passed' : 'Nothing landed'))}</div>${lsTierPill(-1)}<div class="pt">+0</div>`; return; }
  G.$res.innerHTML = `<div class="nm">${lsEsc(lsName(P, r))}</div>${t == null ? `<span class="ls-tier scan">${lsEsc(T('Measuring…'))}</span>` : lsTierPill(t, sh)}<div class="pt">${t == null ? '' : '+' + pts}</div>`;
}
function lsPopup(G, t, pts) {
  const p = G.$pop, S = G.scene;
  p.style.left = (S.px() + (S.port ? 120 : 190)) + 'px'; p.style.top = (S.py() + (S.port ? 70 : 10)) + 'px';
  p.innerHTML = t >= 0 ? `<b style="color:${LS_TIERS[t].c}">${lsEsc(T(LS_TIERS[t].n))}</b><span>+${pts}</span>` : `<b style="color:#ff9b9b">${lsEsc(T('Nothing landed'))}</b><span>+0</span>`;
  p.classList.remove('go'); void p.offsetWidth; p.classList.add('go');
}
function lsMilestone(G, before, after) {
  const a = lsZone(before).last, b = lsZone(after).last;
  if (a !== b && b.au > 1) { G.snd.milestone(); G.api.toast(T('Past {name}', { name: T(b.n) })); }
}

function lsStartRound(G, o) {
  lsHidePane(G);
  const R = { mode: o.mode, ids: o.ids.slice(), n: o.mode === 'endless' ? 0 : o.ids.length, secs: o.secs, day: o.day || 0, i: o.start || 0, phase: 'idle', left: 0, grace: 0, pts: 0, res: [], tiers: [], lives: 3, tok: 0, lvl: o.lvl || 0, bot: o.mode === 'bot' ? { name: 'Bot ' + LS_BOTN[(o.lvl * 3 + Math.floor(Date.now() / 1024)) % LS_BOTN.length], pts: 0, res: [], at: 0, done: false } : null, rng: lsRng(o.seed || (Date.now() >>> 0)), wait: 0, P: null, me: false, botDone: false };
  if (R.mode === 'daily') {
    const d = G.sv.days[R.day];
    if (d) d.a.forEach((x, i) => { R.res[i] = { k: x[0], pts: x[1], t: x[2], ms: x[3], sh: x[4] }; R.tiers[i] = x[2]; R.pts += x[1]; });
  }
  G.R = R;
  G.mode = R.mode;
  G.scene.best = R.mode === 'endless' ? G.sv.endless : R.mode === 'daily' ? G.sv.best : 0;
  G.scene.pmax = R.mode === 'endless' ? 2500 : 130;
  G.scene.set(R.pts, true);
  const pre = R.ids.slice(R.i, R.i + 10).map(id => lsPrompt(id)).filter(Boolean);
  lsFetchStats(pre);
  lsNextQ(G);
}
function lsNextQ(G) {
  const R = G.R;
  if (!R) return;
  if (R.mode === 'endless' && R.i >= R.ids.length) R.ids = R.ids.concat(lsRandomPrompts(30, R.rng() * 4294967296, { avoid: R.ids.slice(-60) }));
  if (R.mode !== 'endless' && R.i >= R.n) return lsEndRound(G);
  const P = lsPrompt(R.ids[R.i]);
  if (!P) { R.i++; return lsNextQ(G); }
  R.P = P; R.phase = 'ask'; R.left = R.secs; R.grace = .8; R.me = false; R.tok++; R.t0 = performance.now(); R.used = 0;
  if (R.bot) { R.bot.row = lsBotPick(P, R.lvl, R.rng); R.bot.at = lsBotTime(R.lvl, R.secs, R.rng); R.bot.done = false; if (R.bot.at > R.secs - .3) R.bot.row = null; }
  if (R.mode === 'daily') {
    const d = G.sv.days[R.day] || (G.sv.days[R.day] = { a: [], p: R.ids.slice(), done: false, at: Date.now() });
    if (d.a.length <= R.i) { d.a[R.i] = ['', 0, -1, 0, 0, 0]; lsSave(G); }
  }
  lsShowQ(G, P, R.i, R.n, R.secs);
  if (R.bot) { G.$lk.hidden = false; G.$lk.innerHTML = `<span class="ls-opp">${lsAv(R.bot.name, 1)}<span data-opp>${lsEsc(T('Thinking…'))}</span></span>`; }
  lsHud(G, true);
}
function lsTick(G, dt) {
  const R = G.R;
  if (!R || G.online) return;
  if (R.phase === 'ask') {
    if (R.grace > 0) R.grace -= dt; else R.left -= dt;
    R.used += dt;
    if (R.bot && !R.bot.done && R.used >= R.bot.at) lsBotLock(G);
    if (R.left <= 0) { R.left = 0; lsTimeUp(G); }
    else lsTimerUI(G, R.left, R.secs);
  } else if (R.phase === 'wait') {
    if (R.left > 0) { R.left -= dt; R.used += dt; }
    if (R.bot && !R.bot.done && R.used >= R.bot.at) lsBotLock(G);
    if (R.left <= 0 && R.bot && !R.bot.done) { R.bot.done = true; R.bot.res[R.i] = null; }
    lsTimerUI(G, Math.max(0, R.left), R.secs);
    if (R.fin && (!R.bot || R.bot.done)) lsDuelReveal(G);
  } else if (R.phase === 'lock' || R.phase === 'show') {
    R.wait -= dt;
    if (R.wait <= 0) { R.phase = 'idle'; if (R.over) return lsEndRound(G); R.i++; lsNextQ(G); }
  }
}
function lsBotLock(G) {
  const R = G.R, b = R.bot;
  b.done = true;
  if (b.row) { const sh = lsShare(R.P, b.row, lsLiveOf(R.P, b.row)), t = lsTier(sh); b.res[R.i] = { k: b.row.k, t, sh, pts: LS_TIERS[t].p, ms: Math.round(b.at * 1000) }; b.pts += LS_TIERS[t].p; }
  else b.res[R.i] = null;
  const o = G.$lk.querySelector('[data-opp]');
  if (o) o.textContent = b.row ? T('Locked in') : T('Thinking…');
  if (b.row) G.snd.tap();
}
function lsSubmit(G, auto) {
  const R = G.R;
  if (G.online) return G.onlineSubmit(auto);
  if (!R) return;
  if (R.phase === 'lock' || R.phase === 'show') { if (!auto && R.fin && !R.over) R.wait = Math.min(R.wait, .12); return; }
  if (R.phase !== 'ask' || R.me) return;
  const m = lsMatch(R.P, G.$in.value);
  if (!m.ok) { if (!auto) lsFeedback(G, m.why); return false; }
  lsLock(G, m.row);
  return true;
}
function lsLock(G, r) {
  const R = G.R, P = R.P, tok = R.tok, i = R.i, ms = Math.round(R.used * 1000);
  R.me = true; R.fin = false;
  R.phase = R.bot ? 'wait' : 'lock'; R.wait = 9;
  G.$in.value = ''; G.$in.classList.add('locked');
  lsResCard(G, P, r, null);
  G.snd.lock();
  const t0 = performance.now();
  const done = live => {
    if (!G.alive || G.R !== R || R.tok !== tok) return;
    const sh = lsShare(P, r, live || lsLiveOf(P, r)), t = lsTier(sh), pts = LS_TIERS[t].p, before = R.pts;
    R.res[i] = { k: r.k, t, sh, pts, ms, live: !!live };
    R.tiers[i] = t; R.pts += pts; R.fin = true;
    lsResCard(G, P, r, t, sh, pts);
    G.scene.boost(t); G.scene.set(R.pts);
    G.snd.tier(t); G.snd.burn(t);
    lsPopup(G, t, pts);
    lsMilestone(G, before, R.pts);
    G.sv.tiers[t]++;
    if (R.mode === 'endless' && t === 5 && R.lives < 3) { R.lives++; G.snd.fuel(); G.api.toast(T('Long Shot! +1 fuel')); }
    if (R.mode === 'daily') { const d = G.sv.days[R.day]; if (d) d.a[i] = [r.k, pts, t, ms, Math.round(sh * 1e6) / 1e6, live ? 1 : 0]; }
    lsSave(G);
    lsHud(G, true);
    if (R.phase === 'lock') R.wait = 2.3;
  };
  const req = lsRecord(P, r);
  let fired = false;
  const fire = v => { if (fired) return; fired = true; done(v); };
  req.then(v => { const wt = Math.max(0, 650 - (performance.now() - t0)); setTimeout(() => fire(v), wt); });
  setTimeout(() => fire(null), 1400);
}
function lsTimeUp(G) {
  const R = G.R;
  if (R.me) return;
  if (G.$in.value.trim() && lsSubmit(G, true)) return;
  lsMiss(G, 'time');
}
function lsMiss(G, why) {
  const R = G.R;
  if (!R || R.me || (R.phase !== 'ask')) return;
  R.me = true; R.fin = true;
  R.res[R.i] = null; R.tiers[R.i] = -1;
  lsResCard(G, R.P, null, -1, 0, 0, { why });
  G.$fb.textContent = why === 'time' ? T('Time’s up!') : ''; G.$fb.className = 'ls-fb bad';
  lsPopup(G, -1, 0);
  if (why === 'pass') G.snd.pass(); else G.snd.miss();
  if (R.mode === 'endless') { R.lives--; if (R.lives <= 0) { R.phase = 'show'; R.wait = 1.8; R.over = true; lsHud(G, true); return; } }
  if (R.bot) R.phase = 'wait';
  else { R.phase = 'show'; R.wait = 1.9; }
  lsHud(G, true);
}
function lsDuelReveal(G) {
  const R = G.R;
  if (R.phase === 'show') return;
  R.phase = 'show'; R.wait = 3.4; R.fin = true;
  const P = R.P, me = R.res[R.i], b = R.bot.res[R.i];
  const row = (name, x, cls, i) => `<div class="ls-pl${cls}">${lsAv(name, i)}<div class="nm"><b>${lsEsc(name)}</b><span>${x ? lsEsc(lsName(P, P.set.bySlug.get(x.k))) : lsEsc(T('No answer'))}</span></div>${x ? lsTierPill(x.t) : lsTierPill(-1)}<div class="pt">+${x ? x.pts : 0}</div><div class="tot">${lsFmt(cls ? R.pts : R.bot.pts)}</div></div>`;
  G.$lk.hidden = false;
  G.$lk.innerHTML = `<span class="ls-opp">${lsEsc(R.bot.name)}: ${b ? lsEsc(lsName(P, P.set.bySlug.get(b.k))) + ' · +' + b.pts : lsEsc(T('No answer'))}</span>`;
  G.$in.placeholder = T('Press Enter to continue.');
  lsPane(G, `<div class="ls-rv solo"><div class="ls-rvq">${lsEsc(T('Prompt {i} of {n}', { i: R.i + 1, n: R.n }))}</div><div class="ls-rvt">${lsEsc(lsPromptText(P))}</div>${row(G.myName(), me, ' me', 0)}${row(R.bot.name, b, '', 1)}<p class="ls-note">${lsEsc(T('Press Enter to continue.'))}</p></div>`, { clear: true, low: true, key: 'rv', keep: true });
}
function lsEndRound(G) {
  const R = G.R;
  R.phase = 'end';
  G.$q.hidden = true;
  lsHud(G, true);
  if (R.mode === 'daily') {
    const d = G.sv.days[R.day];
    if (d) { d.done = true; d.at = Date.now(); }
    if (R.pts > G.sv.best) G.sv.best = R.pts;
    lsSave(G);
    G.api.submit(R.pts);
    G.snd.fanfare();
    lsDailyResults(G, R.day);
  } else if (R.mode === 'endless') {
    G.sv.eRuns++;
    const nb = R.pts > G.sv.endless;
    if (nb) G.sv.endless = R.pts;
    lsSave(G);
    G.snd.lose();
    lsEndlessResults(G, R, nb);
  } else if (R.mode === 'bot') {
    const me = R.pts, op = R.bot.pts, tm = x => x.reduce((s, v) => s + (v ? v.ms : 0), 0);
    const res = me > op ? 1 : me < op ? 0 : tm(R.res) < tm(R.bot.res) ? 1 : tm(R.res) > tm(R.bot.res) ? 0 : .5;
    const dr = lsElo(G.sv.rating, LS_BOTS[R.lvl].r, res, 24);
    G.sv.rating = Math.max(100, G.sv.rating + dr);
    if (res === 1) G.sv.duel.w++; else if (res === 0) G.sv.duel.l++; else G.sv.duel.d++;
    lsSave(G);
    if (res === 1) G.snd.win(); else G.snd.lose();
    lsDuelResults(G, { me, op, res, dr, opName: R.bot.name, myRes: R.res, opRes: R.bot.res, ids: R.ids, again: 'bot:' + R.lvl });
  }
}
function lsSheet(G, items) {
  return `<div class="ls-sheet">${items.map((x, i) => {
    const P = lsPrompt(x.id);
    if (!P) return '';
    const r = x.k ? P.set.bySlug.get(x.k) : null;
    const extra = x.opp !== undefined ? `<br>${lsEsc(x.oppName)}: <b>${x.opp ? lsEsc(lsName(P, P.set.bySlug.get(x.opp.k))) : lsEsc(T('No answer'))}</b>${x.opp ? ' · ' + x.opp.pts : ''}` : '';
    return `<div class="ls-it"><button type="button" data-act="sheet" data-i="${i}" aria-expanded="false"><span class="n">${i + 1}</span><span><span class="q">${lsEsc(lsPromptText(P))}</span><span class="a${r ? '' : ' miss'}">${r ? lsEsc(lsName(P, r)) : lsEsc(T('No answer'))}</span></span>${r ? lsTierPill(x.t, x.sh) : lsTierPill(-1)}<span class="p">${x.pts}</span></button><div class="x" hidden data-id="${lsEsc(x.id)}"><span data-fill></span>${extra}</div></div>`;
  }).join('')}</div>`;
}
function lsSheetOpen(G, btn) {
  const it = btn.parentElement, x = it.querySelector('.x');
  if (!x) return;
  const open = x.hidden;
  x.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) lsSheetFill(x);
}
function lsSheetFill(x) {
  const f = x.querySelector('[data-fill]'), P = lsPrompt(x.dataset.id);
  if (!f || !P) return;
  const top = lsTop(P, 3).map(([r, sh]) => `<b>${lsEsc(lsName(P, r))}</b> ${lsEsc(lsPct(sh))}`).join(' · ');
  const rare = lsRare(P, 3).map(r => `<em>${lsEsc(lsName(P, r))}</em>`).join(' · ');
  f.innerHTML = `${lsEsc(T('Most said:'))} ${top}<br>${lsEsc(T('Long shots you could have said:'))} ${rare}`;
}
function lsDailyResults(G, day) {
  const d = G.sv.days[day];
  if (!d) return lsMenu(G);
  const pts = lsDayPts(d), z = lsZone(pts), ids = d.p.length ? d.p : lsDaily(day);
  const items = d.a.map((x, i) => ({ id: ids[i], k: x[0], pts: x[1], t: x[2], sh: x[4] }));
  const tiers = d.a.map(x => x[2]);
  G.R = G.R && G.R.mode === 'daily' ? G.R : null;
  lsFetchStats(ids.map(id => lsPrompt(id)).filter(Boolean)).then(ok => { if (ok && G.paneKey === 'daily' && G.alive) G.$pane.querySelectorAll('.ls-it .x:not([hidden])').forEach(lsSheetFill); });
  G.scene.set(pts, false);
  const html = `<div class="ls-box wide"><div class="ls-kick">${lsEsc(T('Daily launch #{n}', { n: day + 1 }))} · ${lsEsc(lsDate(day))}</div>
<h2>${lsEsc(T('Mission complete'))}</h2>
<div class="ls-big">${lsEsc(lsKm(pts))}</div>
<div class="ls-zone">${lsEsc(z.last.au > 1 ? T('Your probe flew past {name}', { name: T(z.last.n) }) : T('Your probe stayed near Earth'))}</div>
<div class="ls-stats"><div><b>${lsFmt(pts)} / ${LS_N * 100}</b><span>${lsEsc(T('Points'))}</span></div><div><b>${lsStreak(G.sv)}</b><span>${lsEsc(T('Streak'))}</span></div><div><b>${lsFmt(G.sv.best)}</b><span>${lsEsc(T('Best day'))}</span></div></div>
<div class="ls-tl">${tiers.map(t => t >= 0 ? `<span style="background:${LS_TIERS[t].c}">${LS_TIERS[t].p}</span>` : `<span style="background:${LS_MISS.c};color:#fff">0</span>`).join('')}</div>
${lsSheet(G, items)}
<div class="ls-pair"><button class="ls-btn hot" type="button" data-act="share" data-focus>${lsEsc(T('Share card'))}</button><button class="ls-btn blue" type="button" data-act="endless">${lsEsc(T('Endless'))}<small>${lsEsc(T('Keep flying'))}</small></button></div>
<button class="ls-btn ghost" type="button" data-act="menu">${lsEsc(T('Menu'))}</button>
<p class="ls-note">${lsEsc(T('Next launch in {t}', { t: lsDur(lsNextDayMs()) }))}</p>${lsLiveNote()}</div>`;
  G.shareInfo = { day, pts, tiers, mode: 'daily' };
  G.rerender = () => lsDailyResults(G, day);
  lsPane(G, html, { key: 'daily' });
}
function lsEndlessResults(G, R, nb) {
  const items = R.ids.slice(0, R.i + 1).map((id, i) => { const x = R.res[i]; return x ? { id, k: x.k, pts: x.pts, t: x.t, sh: x.sh } : { id, k: '', pts: 0, t: -1 }; });
  const z = lsZone(R.pts);
  G.shareInfo = { pts: R.pts, tiers: items.map(x => x.t), mode: 'endless' };
  G.rerender = () => lsEndlessResults(G, R, nb);
  lsPane(G, `<div class="ls-box wide"><div class="ls-kick">${lsEsc(T('Endless'))}</div><h2>${lsEsc(T('Out of fuel'))}</h2>
<div class="ls-big">${lsEsc(lsKm(R.pts))}</div><div class="ls-zone">${lsEsc(z.last.au > 1 ? T('Your probe flew past {name}', { name: T(z.last.n) }) : T('Your probe stayed near Earth'))}</div>
<div class="ls-stats"><div><b>${lsFmt(R.pts)}</b><span>${lsEsc(T('Points'))}</span></div><div><b>${items.filter(x => x.k).length}</b><span>${lsEsc(T('Answers landed'))}</span></div><div><b>${lsFmt(G.sv.endless)}</b><span>${lsEsc(nb ? T('New best!') : T('Best'))}</span></div></div>
${lsSheet(G, items)}
<div class="ls-pair"><button class="ls-btn hot" type="button" data-act="endless" data-focus>${lsEsc(T('Fly again'))}</button><button class="ls-btn blue" type="button" data-act="share">${lsEsc(T('Share card'))}</button></div>
<button class="ls-btn ghost" type="button" data-act="menu">${lsEsc(T('Menu'))}</button>${lsLiveNote()}</div>`, { key: 'endless' });
}
function lsDuelResults(G, o) {
  const items = o.ids.map((id, i) => { const x = o.myRes[i]; return Object.assign(x ? { id, k: x.k, pts: x.pts, t: x.t, sh: x.sh } : { id, k: '', pts: 0, t: -1 }, { opp: o.opRes[i] || null, oppName: o.opName }); });
  const title = o.res === 1 ? T('You win!') : o.res === 0 ? T('You lose') : T('Draw');
  G.rerender = () => lsDuelResults(G, o);
  lsPane(G, `<div class="ls-box wide"><div class="ls-kick">${lsEsc(T('Duel'))} · ${lsEsc(o.opName)}</div><h2>${lsEsc(title)}</h2>
<div class="ls-stats"><div><b>${lsFmt(o.me)}</b><span>${lsEsc(T('You'))}</span></div><div><b>${lsFmt(o.op)}</b><span>${lsEsc(o.opName)}</span></div>${o.dr != null ? `<div><b>${lsFmt(G.sv.rating)} <small style="font-size:14px;color:${o.dr >= 0 ? '#36d6a0' : '#ff9b9b'}">${o.dr >= 0 ? '+' : ''}${o.dr}</small></b><span>${lsEsc(T('Rating'))}</span></div>` : ''}</div>
${lsSheet(G, items)}
${o.again ? `<button class="ls-btn hot" type="button" data-act="${o.again === 'online' ? 'again' : 'duelbot'}" data-v="${o.again.split(':')[1] || ''}" data-focus>${lsEsc(o.again === 'online' ? T('Back to lobby') : T('Rematch'))}</button>` : ''}
<button class="ls-btn ghost" type="button" data-act="${o.online ? 'leave' : 'menu'}">${lsEsc(T('Menu'))}</button>${lsLiveNote()}</div>`, { key: 'duel' });
}
function lsShareText(G, s) {
  const em = s.tiers.map(t => t >= 0 ? LS_TIERS[t].e : LS_MISS.e).join('');
  const head = s.mode === 'daily' ? 'Long Shot #' + (s.day + 1) : 'Long Shot · ' + T('Endless');
  return head + ' · ' + lsKm(s.pts) + '\n' + em + ' ' + lsFmt(s.pts) + (s.mode === 'daily' ? ' / ' + LS_N * 100 : '') + ' ' + T('pts') + '\n' + 'https://gameplaygames.web.app/long-shot';
}
function lsShareCard(G) {
  const s = G.shareInfo;
  if (!s) return;
  const z = lsZone(s.pts);
  const cv = lsCardCanvas({ day: s.day || 0, kicker: s.mode === 'daily' ? T('Daily launch #{n}', { n: s.day + 1 }) + ' · ' + lsDate(s.day) : T('Endless'), sub: T('Name the answer nobody else thinks of'), pts: s.pts, dist: lsKm(s.pts), zone: z.last.au > 1 ? T('Past {name}', { name: T(z.last.n) }) : T('Near Earth'), tiers: s.tiers.slice(0, 12), score: s.mode === 'daily' ? lsFmt(s.pts) + ' / ' + LS_N * 100 + ' ' + T('pts') : lsFmt(s.pts) + ' ' + T('pts') });
  let url = '';
  try { url = cv.toDataURL('image/png'); } catch (e) {}
  G.shareCv = cv;
  const txt = lsShareText(G, s);
  G.shareTxt = txt;
  if (G.paneKey !== 'share') G.shareBack = G.rerender;
  G.rerender = () => lsShareCard(G);
  lsPane(G, `<div class="ls-box"><div class="ls-kick">${lsEsc(T('Share card'))}</div>${url ? `<img class="ls-card" src="${url}" alt="${lsEsc(T('Your Long Shot share card'))}">` : ''}<div class="ls-share">${lsEsc(txt)}</div>
<div class="ls-grid"><button class="ls-btn hot" type="button" data-act="share-go" data-focus>${lsEsc(T('Share'))}</button><button class="ls-btn blue" type="button" data-act="share-copy">${lsEsc(T('Copy text'))}</button><button class="ls-btn teal" type="button" data-act="share-save">${lsEsc(T('Save image'))}</button></div>
<p class="ls-note">${lsEsc(T('The card shows your rarity tiers, never your answers.'))}</p><button class="ls-btn ghost" type="button" data-act="share-back">${lsEsc(T('Back'))}</button></div>`, { key: 'share' });
}
function lsCopy(G, txt) {
  const ok = () => G.api.toast(T('Copied'));
  try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(ok, () => lsCopyOld(G, txt)); return; } } catch (e) {}
  lsCopyOld(G, txt);
}
function lsCopyOld(G, txt) {
  const ta = document.createElement('textarea');
  ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.append(ta); ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) {}
  ta.remove();
  G.api.toast(ok ? T('Copied') : T('Could not copy'));
}
function lsShareGo(G) {
  const txt = G.shareTxt || '', cv = G.shareCv;
  if (navigator.share && cv && cv.toBlob) {
    cv.toBlob(b => {
      const f = b && typeof File === 'function' ? new File([b], 'long-shot.png', { type: 'image/png' }) : null;
      const data = f && navigator.canShare && navigator.canShare({ files: [f] }) ? { text: txt, files: [f] } : { text: txt };
      navigator.share(data).catch(() => {});
    }, 'image/png');
    return;
  }
  lsCopy(G, txt);
}
function lsShareSave(G) {
  const cv = G.shareCv;
  if (!cv || !cv.toBlob) return;
  cv.toBlob(b => {
    if (!b) return;
    const u = URL.createObjectURL(b), a = document.createElement('a');
    a.href = u; a.download = 'long-shot.png'; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 4000);
  }, 'image/png');
}
function lsMenu(G) {
  G.R = null; G.mode = 'menu'; G.online = false;
  G.$q.hidden = true; lsHud(G, false);
  G.api.score(null);
  const day = lsDay(), d = G.sv.days[day], done = d && d.done, part = d && !d.done && d.a.length > 0;
  G.scene.set(done ? lsDayPts(d) : 0, false);
  G.scene.best = G.sv.best; G.scene.pmax = 130;
  G.rerender = () => lsMenu(G);
  const daily = done ? `<button class="ls-btn teal" type="button" data-act="today" data-focus>${lsEsc(T('See today’s results'))}<small>${lsEsc(T('{n} pts · next launch in {t}', { n: lsFmt(lsDayPts(d)), t: lsDur(lsNextDayMs()) }))}</small></button>` : `<button class="ls-btn hot" type="button" data-act="daily" data-focus>${lsEsc(part ? T('Continue daily launch #{n}', { n: day + 1 }) : T('Daily launch #{n}', { n: day + 1 }))}<small>${lsEsc(part ? T('Prompt {i} of {n}', { i: Math.min(LS_N, d.a.length + 1), n: LS_N }) : T('Same 7 prompts for everyone today'))}</small></button>`;
  lsPane(G, `<div class="ls-box"><div class="ls-logo"><b>LONG SHOT</b></div>
<p>${lsEsc(T('Name something that fits the prompt. The fewer players who say it, the further your probe flies.'))}</p>
${daily}
<div class="ls-grid"><button class="ls-btn blue" type="button" data-act="endless">${lsEsc(T('Endless'))}<small>${lsEsc(T('3 fuel cells'))}</small></button><button class="ls-btn vio" type="button" data-act="room">${lsEsc(T('Live room'))}<small>${lsEsc(T('Up to {n} players', { n: 16 }))}</small></button><button class="ls-btn teal" type="button" data-act="duel">${lsEsc(T('1 v 1 duel'))}<small>${lsEsc(T('Rating {n}', { n: lsFmt(G.sv.rating) }))}</small></button></div>
<div class="ls-stats"><div><b>${lsStreak(G.sv)}</b><span>${lsEsc(T('Streak'))}</span></div><div><b>${lsFmt(G.sv.best)}</b><span>${lsEsc(T('Best day'))}</span></div><div><b>${lsFmt(G.sv.endless)}</b><span>${lsEsc(T('Endless best'))}</span></div></div>
<div class="ls-pair"><button class="ls-btn ghost" type="button" data-act="how">${lsEsc(T('How to play'))}</button><button class="ls-btn ghost" type="button" data-act="stats">${lsEsc(T('Statistics'))}</button></div>
${lsLiveNote()}<p class="ls-note">${lsEsc(T('Answers are checked in English and French.'))}</p></div>`, { key: 'menu' });
}
function lsHow(G) {
  G.rerender = () => lsHow(G);
  lsPane(G, `<div class="ls-box"><div class="ls-kick">${lsEsc(T('How to play'))}</div><h2>${lsEsc(T('Think of the answer nobody else will'))}</h2>
<p>${lsEsc(T('Each prompt asks for one thing, like a country in Africa. Type an answer before the clock runs out. Wrong answers cost nothing but time, so keep trying.'))}</p>
<p>${lsEsc(T('Your first accepted answer locks in. The fewer players who gave it, the more points it scores. Points push your probe out through the Solar System: every point is 15 million km.'))}</p>
<div class="ls-tl">${LS_TIERS.map(t => `<span style="background:${t.c}">${lsEsc(T(t.n))} · ${t.p}</span>`).join('')}</div>
<p>${lsEsc(T('Daily launch: the same 7 prompts for everyone, 25 seconds each, once a day. Endless: keep going until your 3 fuel cells run out; a Long Shot answer refuels one. Live room: everyone gets the same prompt at the same moment. Duel: 7 prompts, 15 seconds each, against a player or the computer, for a rating.'))}</p>
<p>${lsEsc(T('Small typos and plurals are fine. Press Enter to launch an answer.'))}</p>
<button class="ls-btn hot" type="button" data-act="menu" data-focus>${lsEsc(T('Got it'))}</button></div>`, { key: 'how' });
}
function lsStats(G) {
  const sv = G.sv, days = Object.keys(sv.days).map(Number).filter(k => sv.days[k].done), tot = days.reduce((s, k) => s + lsDayPts(sv.days[k]), 0), mx = Math.max(1, ...sv.tiers);
  G.rerender = () => lsStats(G);
  lsPane(G, `<div class="ls-box"><div class="ls-kick">${lsEsc(T('Statistics'))}</div><h2>${lsEsc(T('Your flight log'))}</h2>
<div class="ls-stats"><div><b>${days.length}</b><span>${lsEsc(T('Daily launches'))}</span></div><div><b>${days.length ? lsFmt(Math.round(tot / days.length)) : '—'}</b><span>${lsEsc(T('Average'))}</span></div><div><b>${lsFmt(sv.best)}</b><span>${lsEsc(T('Best day'))}</span></div></div>
<div class="ls-stats"><div><b>${lsStreak(sv)}</b><span>${lsEsc(T('Streak'))}</span></div><div><b>${lsBestStreak(sv)}</b><span>${lsEsc(T('Best streak'))}</span></div><div><b>${lsFmt(sv.endless)}</b><span>${lsEsc(T('Endless best'))}</span></div></div>
<div class="ls-stats"><div><b>${lsFmt(sv.rating)}</b><span>${lsEsc(T('Rating'))}</span></div><div><b>${sv.duel.w}–${sv.duel.l}${sv.duel.d ? '–' + sv.duel.d : ''}</b><span>${lsEsc(T('Duels'))}</span></div><div><b>${sv.rooms.w} / ${sv.rooms.p}</b><span>${lsEsc(T('Room wins'))}</span></div></div>
<h3>${lsEsc(T('Answers by rarity'))}</h3>
<div class="ls-bars">${LS_TIERS.map((t, i) => `<div><span>${lsEsc(T(t.n))}</span><i style="width:${Math.round(sv.tiers[i] / mx * 100)}%;background:${t.c}"></i><b>${sv.tiers[i]}</b></div>`).join('')}</div>
<button class="ls-btn hot" type="button" data-act="menu" data-focus>${lsEsc(T('Back'))}</button></div>`, { key: 'stats' });
}
function lsDailyIntro(G) {
  const day = lsDay();
  G.rerender = () => lsDailyIntro(G);
  lsPane(G, `<div class="ls-box"><div class="ls-kick">${lsEsc(T('Daily launch #{n}', { n: day + 1 }))} · ${lsEsc(lsDate(day))}</div><h2>${lsEsc(T('Ready for launch?'))}</h2>
<p>${lsEsc(T('7 prompts, 25 seconds each. Everyone gets the same prompts today, and you only get one go.'))}</p>
<div class="ls-tl">${LS_TIERS.map(t => `<span style="background:${t.c}">${lsEsc(T(t.n))} · ${t.p}</span>`).join('')}</div>
<button class="ls-btn hot" type="button" data-act="daily-go" data-focus>${lsEsc(T('Launch'))}</button><button class="ls-btn ghost" type="button" data-act="menu">${lsEsc(T('Back'))}</button></div>`, { key: 'intro' });
}
function lsDailyStart(G) {
  const day = lsDay(), d = G.sv.days[day];
  if (d && d.done) return lsDailyResults(G, day);
  const ids = d && d.p.length === LS_N ? d.p : lsDaily(day);
  if (d) d.p = ids.slice();
  const start = d ? d.a.length : 0;
  lsStartRound(G, { mode: 'daily', ids, secs: LS_SECS, day, start });
}
function lsDuelMenu(G) {
  G.rerender = () => lsDuelMenu(G);
  lsPane(G, `<div class="ls-box"><div class="ls-kick">${lsEsc(T('1 v 1 duel'))}</div><h2>${lsEsc(T('Rating {n}', { n: lsFmt(G.sv.rating) }))}</h2>
<p>${lsEsc(T('Same 7 prompts, 15 seconds each. More points wins; if it is a tie, the faster scorer wins.'))}</p>
<button class="ls-btn vio" type="button" data-act="duel-net" data-focus>${lsEsc(T('Play a person online'))}<small>${lsEsc(T('Share a code or join a public duel'))}</small></button>
<h3>${lsEsc(T('Play the computer'))}</h3>
<div class="ls-pair">${LS_BOTS.map((b, i) => `<button class="ls-btn ${['teal', 'blue', 'vio', 'hot'][i]}" type="button" data-act="duelbot" data-v="${i}">${lsEsc(T(b.n))}<small>${lsEsc(T('Rating {n}', { n: b.r }))}</small></button>`).join('')}</div>
<button class="ls-btn ghost" type="button" data-act="menu">${lsEsc(T('Back'))}</button></div>`, { key: 'duelmenu' });
}
function lsRoomMenu(G) {
  const o = G.sv.room;
  G.rerender = () => lsRoomMenu(G);
  lsPane(G, `<div class="ls-box"><div class="ls-kick">${lsEsc(T('Live room'))}</div><h2>${lsEsc(T('Room settings'))}</h2>
<p>${lsEsc(T('Everyone answers the same prompt at the same moment. These settings are used when you host.'))}</p>
<div class="ls-opt"><span>${lsEsc(T('Prompts'))}</span>${lsSeg('n', [[5, '5'], [7, '7'], [10, '10'], [15, '15']], o.n)}</div>
<div class="ls-opt"><span>${lsEsc(T('Seconds per prompt'))}</span>${lsSeg('s', [[15, '15'], [20, '20'], [25, '25'], [30, '30']], o.s)}</div>
<div class="ls-opt"><span>${lsEsc(T('Bot level'))}</span>${lsSeg('b', LS_BOTS.map((b, i) => [i, T(b.n)]), o.b)}</div>
<button class="ls-btn vio" type="button" data-act="room-go" data-focus>${lsEsc(T('Open the room'))}</button><button class="ls-btn ghost" type="button" data-act="menu">${lsEsc(T('Back'))}</button></div>`, { key: 'roommenu' });
}
const LS_NK = 'gameplay:long-shot:kind';
function lsNetHook(G) {
  if (G.netHooked) return;
  G.netHooked = true;
  const net = G.api.net;
  net.on('data', (m, from) => { if (G.alive) lsNetData(G, m, from); });
  net.on('leave', p => { if (G.H && p) lsHostGone(G, p.id); });
  net.on('rejoin', p => { if (G.H && p) lsHostSnap(G, p.id); });
  net.on('lobby', () => { if (G.online && G.role === 'guest') lsOnline(G, G.netKind || 'room'); });
  net.on('close', reason => {
    if (!G.online) return;
    G.ntok++; G.online = false; G.H = null; G.C = null; G.role = null;
    G.$q.hidden = true; lsHud(G, false);
    const hd = reason === 'kicked' ? T('You were removed') : reason === 'host-left' ? T('The host left') : T('Connection lost');
    G.rerender = null;
    lsPane(G, `<div class="ls-box"><div class="ls-kick">${lsEsc(T('Online'))}</div><h2>${lsEsc(hd)}</h2><p>${lsEsc(T('The match has ended.'))}</p><button class="ls-btn vio" type="button" data-act="room" data-focus>${lsEsc(T('Live room'))}</button><button class="ls-btn ghost" type="button" data-act="menu">${lsEsc(T('Menu'))}</button></div>`, { key: 'gone' });
  });
}
function lsSend(G, m) {
  if (G.role !== 'host') return;
  try { G.api.net.send(m); } catch (e) {}
  lsClient(G, m);
}
function lsSendTo(G, id, m) {
  if (id === G.me) { lsClient(G, m); return; }
  try { G.api.net.sendTo(id, m); } catch (e) {}
}
async function lsOnline(G, kind) {
  lsNetHook(G);
  const tok = ++G.ntok;
  G.R = null; G.online = true; G.role = null; G.H = null; G.C = null; G.netKind = kind;
  try { sessionStorage.setItem(LS_NK, kind); } catch (e) {}
  G.$q.hidden = true; lsHud(G, false); lsHidePane(G);
  G.scene.set(0, false);
  const o = kind === 'duel' ? { sizes: [2], defaultSize: 2, min: 2, bots: false } : { sizes: [2, 3, 4, 6, 8, 10, 12, 16, 24, 32, 40], defaultSize: 8, min: 2, bots: true };
  let r = null;
  try { r = await G.api.net.room(o); } catch (e) { r = null; }
  if (!G.alive || tok !== G.ntok) return;
  if (!r) { G.online = false; return lsMenu(G); }
  G.role = r.role; G.me = r.id;
  if (r.role === 'host') lsHostStart(G, r, kind);
  else {
    G.rerender = () => lsWaitPane(G);
    lsWaitPane(G);
    const ask = n => G.api.timeout(() => {
      if (tok !== G.ntok || G.role !== 'guest' || G.C) return;
      try { G.api.net.send({ t: 'hi', r: G.sv.rating }); } catch (e) {}
      if (n < 25) ask(n + 1);
    }, n ? 2500 : 300);
    ask(0);
  }
}
function lsWaitPane(G) {
  lsPane(G, `<div class="ls-box"><div class="ls-kick">${lsEsc(T('Online'))}</div><h2>${lsEsc(T('Connected'))}</h2><p>${lsEsc(T('Waiting for the host to start…'))}</p><button class="ls-btn ghost" type="button" data-act="leave">${lsEsc(T('Leave'))}</button></div>`, { key: 'wait' });
}
function lsHostStart(G, r, kind) {
  const duel = kind === 'duel' && r.players.length === 2 && !r.bots;
  const n = duel ? LS_N : G.sv.room.n, secs = duel ? LS_DUEL_SECS : G.sv.room.s;
  const pl = r.players.map(p => ({ id: p.id, name: p.name, bot: false, tot: 0, ms: 0, res: [], gone: false, lk: false, cur: null, r: p.id === r.id ? G.sv.rating : (G.hiR && G.hiR[p.id]) || 1000 }));
  if (r.bots && !duel) for (let i = pl.length; i < r.size; i++) pl.push({ id: 'b' + i, name: 'Bot ' + LS_BOTN[(i * 7) % LS_BOTN.length], bot: true, lvl: G.sv.room.b, tot: 0, ms: 0, res: [], gone: false, lk: false, cur: null, r: LS_BOTS[G.sv.room.b].r });
  const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
  const ids = lsRandomPrompts(n, seed, { solo: false });
  G.H = { m: duel ? 'duel' : 'room', n, secs, ids, i: -1, pl, phase: 'start', at: Date.now() + 2200, dl: 0, qAt: 0, rng: lsRng(seed ^ 0x5bd1e995), go: null };
  const Ps = ids.map(id => lsPrompt(id)).filter(Boolean);
  lsFetchStats(Ps.slice(0, 10)).then(() => lsFetchStats(Ps.slice(10)));
  G.H.go = { t: 'go', m: G.H.m, n, secs, pl: pl.map(p => ({ id: p.id, name: p.name, bot: p.bot })) };
  lsSend(G, G.H.go);
}
function lsHostTick(G) {
  const H = G.H;
  if (!H || G.role !== 'host') return;
  const now = Date.now();
  if (H.phase === 'start') { if (now >= H.at) lsHostQ(G); return; }
  if (H.phase === 'q') {
    const el = now - H.qAt;
    H.pl.forEach(p => { if (p.bot && !p.lk && p.row !== undefined && el >= p.botAt) { if (p.row) lsHostLock(G, p, p.row, Math.round(p.botAt)); else p.lk = true; } });
    if (now >= H.dl + 700 || H.pl.every(p => p.gone || p.lk)) lsHostReveal(G);
    return;
  }
  if (H.phase === 'rv' && now >= H.at) { if (H.i + 1 >= H.n) lsHostEnd(G); else lsHostQ(G); }
}
function lsHostQ(G) {
  const H = G.H, now = Date.now();
  H.i++; H.phase = 'q'; H.qAt = now; H.dl = now + 800 + H.secs * 1000;
  const P = lsPrompt(H.ids[H.i], 'en');
  H.P = P;
  H.pl.forEach(p => {
    p.lk = false; p.cur = null;
    if (p.bot) { p.row = lsBotPick(P, p.lvl, H.rng); p.botAt = 800 + lsBotTime(p.lvl, H.secs, H.rng) * 1000; if (p.botAt > 800 + H.secs * 1000 - 300) p.row = null; }
  });
  lsSend(G, { t: 'q', i: H.i, n: H.n, p: H.ids[H.i], left: H.dl - now, secs: H.secs });
}
function lsHostLock(G, p, row, ms) {
  const H = G.H, P = H.P, sh = lsShare(P, row, lsLiveOf(P, row)), t = lsTier(sh), pts = LS_TIERS[t].p;
  p.lk = true; p.cur = { k: row.k, t, sh, pts, ms: Math.max(0, ms) };
  if (!p.bot) lsSendTo(G, p.id, { t: 'ok', i: H.i, k: row.k, tier: t, sh: Math.round(sh * 1e6), pts });
  lsSend(G, { t: 'lk', i: H.i, ids: H.pl.filter(x => x.lk && !x.gone).map(x => x.id) });
}
function lsHostAnswer(G, from, m) {
  const H = G.H;
  if (!H || H.phase !== 'q' || m.i !== H.i) return;
  const p = H.pl.find(x => x.id === from && !x.bot);
  if (!p || p.lk || p.gone) return;
  const now = Date.now();
  if (now > H.dl + 700) return;
  const r = lsMatch(H.P, String(m.s || '').slice(0, 48));
  if (!r.ok) { lsSendTo(G, from, { t: 'no', i: H.i, why: r.why }); return; }
  let lat = 0;
  try { const pp = (G.api.net.players || []).find(x => x.id === from); if (pp && pp.ping > 0) lat = Math.min(1500, pp.ping / 2); } catch (e) {}
  lsHostLock(G, p, r.row, Math.round(now - H.qAt - lat));
}
function lsHostReveal(G) {
  const H = G.H;
  H.phase = 'rv'; H.at = Date.now() + (H.m === 'duel' ? 4200 : 5600);
  H.pl.forEach(p => { const c = p.cur; p.res[H.i] = c; if (c) { p.tot += c.pts; p.ms += c.ms; } });
  lsSend(G, { t: 'rv', i: H.i, p: H.ids[H.i], res: H.pl.map(p => { const c = p.cur; return [p.id, c ? c.k : '', c ? c.t : -1, c ? Math.round(c.sh * 1e6) : 0, c ? c.pts : 0, p.tot, c ? c.ms : 0]; }) });
}
function lsHostEnd(G) {
  const H = G.H;
  H.phase = 'end';
  const rank = H.pl.slice().sort((a, b) => b.tot - a.tot || a.ms - b.ms).map(p => [p.id, p.name, p.tot, p.ms, p.bot ? 1 : 0, p.r, p.gone ? 1 : 0]);
  lsSend(G, { t: 'end', m: H.m, rank, ids: H.ids });
}
function lsHostGone(G, id) {
  const H = G.H, p = H && H.pl.find(x => x.id === id);
  if (!p || p.bot) return;
  p.gone = true;
  if (H.phase !== 'end') G.api.toast(T('{name} left the match', { name: p.name }));
}
function lsHostSnap(G, id) {
  const H = G.H;
  if (!H || !H.go) return;
  const p = H.pl.find(x => x.id === id);
  if (!p) return;
  p.gone = false;
  const now = Date.now();
  const s = { t: 'snap', go: H.go, i: H.i, phase: H.phase, p: H.ids[H.i] || '', left: H.phase === 'q' ? Math.max(0, H.dl - now) : 0, tot: H.pl.map(x => [x.id, x.tot]), lk: H.pl.filter(x => x.lk).map(x => x.id), mine: p.res.map(c => c ? [c.k, c.t, Math.round(c.sh * 1e6), c.pts, c.ms] : null), cur: p.cur ? [p.cur.k, p.cur.t, Math.round(p.cur.sh * 1e6), p.cur.pts] : null };
  lsSendTo(G, id, s);
}
function lsNetData(G, m, from) {
  if (!m || typeof m !== 'object' || typeof m.t !== 'string') return;
  if (G.role === 'host') {
    if (m.t === 'a') lsHostAnswer(G, from, m);
    else if (m.t === 'pass') lsHostPass(G, from, m);
    else if (m.t === 'hi') {
      G.hiR = G.hiR || {};
      G.hiR[from] = Math.max(100, Math.min(4000, Math.round(+m.r) || 1000));
      const H = G.H, p = H && H.pl.find(x => x.id === from);
      if (p) p.r = G.hiR[from];
      if (H && H.go) lsHostSnap(G, from);
    }
    return;
  }
  lsClient(G, m);
}
function lsCBegin(G, go) {
  const pl = Array.isArray(go.pl) ? go.pl.slice(0, 48).filter(p => p && typeof p.id === 'string').map(p => ({ id: p.id.slice(0, 20), name: String(p.name || 'Player').replace(/[<>&"']/g, '').slice(0, 20), bot: !!p.bot, tot: 0 })) : [];
  const n = Math.max(1, Math.min(20, Math.round(+go.n) || LS_N)), secs = Math.max(5, Math.min(60, Math.round(+go.secs) || LS_SECS));
  G.C = { m: go.m === 'duel' ? 'duel' : 'room', n, secs, pl, i: -1, P: null, dl: 0, lk: new Set(), me: false, wait: false, res: [], pts: 0, phase: 'start' };
  G.R = { mode: G.C.m === 'duel' ? 'duel' : 'room', n, secs, i: 0, pts: 0, tiers: [], phase: 'start', lives: 3 };
  G.rerender = null;
  lsHidePane(G);
  G.scene.set(0, true);
  lsHud(G, true);
  G.$q.hidden = true;
  lsPopText(G, T('Get ready…'));
}
function lsPopText(G, txt) {
  const p = G.$pop, S = G.scene;
  p.style.left = (S.W / 2) + 'px'; p.style.top = (S.H * .4) + 'px';
  p.innerHTML = `<b style="color:#ffd28a">${lsEsc(txt)}</b>`;
  p.classList.remove('go'); void p.offsetWidth; p.classList.add('go');
}
function lsClient(G, m) {
  if (m.t === 'go') { lsCBegin(G, m); return; }
  if (m.t === 'snap') {
    if (!m.go) return;
    lsCBegin(G, m.go);
    const C = G.C;
    (Array.isArray(m.tot) ? m.tot : []).forEach(([id, t]) => { const p = C.pl.find(x => x.id === id); if (p) p.tot = Math.max(0, +t || 0); });
    (Array.isArray(m.mine) ? m.mine : []).forEach((c, i) => { if (c && Array.isArray(c)) { C.res[i] = { k: String(c[0]), t: Math.max(0, Math.min(5, +c[1] || 0)), sh: (+c[2] || 0) / 1e6, pts: +c[3] || 0, ms: +c[4] || 0 }; G.R.tiers[i] = C.res[i].t; C.pts += C.res[i].pts; } else { C.res[i] = null; G.R.tiers[i] = -1; } });
    G.R.pts = C.pts; G.scene.set(C.pts, true);
    if (m.phase === 'q' && m.p) {
      lsClient(G, { t: 'q', i: m.i, n: C.n, p: m.p, left: m.left, secs: C.secs });
      (Array.isArray(m.lk) ? m.lk : []).forEach(id => C.lk.add(id));
      if (Array.isArray(m.cur)) lsClient(G, { t: 'ok', i: m.i, k: m.cur[0], tier: m.cur[1], sh: m.cur[2], pts: m.cur[3] });
      lsLockRow(G);
    }
    lsHud(G, true);
    return;
  }
  const C = G.C;
  if (!C) return;
  if (m.t === 'q') {
    const P = lsPrompt(String(m.p || ''));
    if (!P) return;
    C.i = Math.max(0, Math.min(C.n - 1, Math.round(+m.i) || 0)); C.P = P; C.me = false; C.wait = false; C.timedOut = false; C.phase = 'q'; C.lk = new Set();
    const rtt = G.role === 'host' ? 0 : (+G.api.net.rtt || 0);
    C.dl = performance.now() + Math.max(0, (+m.left || 0) - rtt / 2);
    C.secs = Math.max(5, Math.min(60, Math.round(+m.secs) || C.secs));
    G.R.i = C.i; G.R.phase = 'ask';
    lsHidePane(G);
    lsShowQ(G, P, C.i, C.n, C.secs);
    lsLockRow(G);
    lsHud(G, true);
    return;
  }
  if (m.t === 'lk') { if (+m.i === C.i && Array.isArray(m.ids)) { C.lk = new Set(m.ids.filter(x => typeof x === 'string')); lsLockRow(G); } return; }
  if (m.t === 'no') { if (+m.i === C.i && C.wait) { C.wait = false; G.$res.hidden = true; G.$pass.hidden = false; G.$in.classList.remove('locked'); G.$in.placeholder = T('Type your answer…'); lsFeedback(G, 'host'); } return; }
  if (m.t === 'ok') {
    if (+m.i !== C.i) return;
    const P = C.P, r = P && P.set.bySlug.get(String(m.k || ''));
    if (!r) return;
    const t = Math.max(0, Math.min(5, Math.round(+m.tier) || 0)), sh = Math.max(0, Math.min(1, (+m.sh || 0) / 1e6)), pts = LS_TIERS[t].p, before = C.pts;
    C.me = true; C.wait = false;
    if (!C.res[C.i]) { C.res[C.i] = { k: r.k, t, sh, pts }; C.pts += pts; }
    G.R.pts = C.pts; G.R.tiers[C.i] = t;
    lsResCard(G, P, r, t, sh, pts);
    G.scene.boost(t); G.scene.set(C.pts);
    G.snd.tier(t); G.snd.burn(t);
    lsPopup(G, t, pts); lsMilestone(G, before, C.pts);
    G.sv.tiers[t]++; lsSave(G);
    lsRecord(P, r);
    lsHud(G, true);
    return;
  }
  if (m.t === 'rv') {
    if (+m.i !== C.i || !C.P) return;
    C.phase = 'rv'; G.R.phase = 'show';
    const P = C.P, rows = Array.isArray(m.res) ? m.res : [];
    rows.forEach(x => { if (!Array.isArray(x)) return; const p = C.pl.find(q => q.id === x[0]); if (p) { p.tot = Math.max(0, +x[5] || 0); p.last = { k: String(x[1] || ''), t: Math.round(+x[2]), sh: (+x[3] || 0) / 1e6, pts: +x[4] || 0, ms: +x[6] || 0 }; p.hist = p.hist || []; p.hist[C.i] = p.last.k ? p.last : null; } });
    if (!C.res[C.i]) { C.res[C.i] = null; G.R.tiers[C.i] = -1; if (!C.me) { lsResCard(G, P, null, -1, 0, 0, { why: 'time' }); G.snd.miss(); } }
    lsHud(G, true);
    const list = C.pl.slice().sort((a, b) => (b.last ? b.last.pts : 0) - (a.last ? a.last.pts : 0) || (a.last ? a.last.ms : 9e9) - (b.last ? b.last.ms : 9e9));
    const html = list.map((p, i) => { const x = p.last, r = x && x.k ? P.set.bySlug.get(x.k) : null; return `<div class="ls-pl${p.id === G.me ? ' me' : ''}" style="animation-delay:${Math.min(i, 12) * .06}s">${lsAv(p.name, C.pl.indexOf(p))}<div class="nm"><b>${lsEsc(p.name)}</b><span>${r ? lsEsc(lsName(P, r)) : lsEsc(T('No answer'))}</span></div>${r ? lsTierPill(x.t) : lsTierPill(-1)}<div class="pt">+${r ? x.pts : 0}</div><div class="tot">${lsFmt(p.tot)}</div></div>`; }).join('');
    G.$lk.hidden = true; G.$pass.hidden = true;
    G.$in.placeholder = T('Next prompt coming up…');
    if (!G.port) G.$q.hidden = true;
    lsPane(G, `<div class="ls-rv${!G.port && list.length > 7 ? ' two' : ''}"><div class="ls-rvq">${lsEsc(T('Prompt {i} of {n}', { i: C.i + 1, n: C.n }))}</div><div class="ls-rvt">${lsEsc(lsPromptText(P))}</div><div class="ls-list">${html}</div></div>`, { clear: true, low: G.port, key: 'rv', keep: true });
    return;
  }
  if (m.t === 'end') {
    C.phase = 'end'; G.R.phase = 'end';
    G.$q.hidden = true;
    const rank = (Array.isArray(m.rank) ? m.rank : []).filter(x => Array.isArray(x)).slice(0, 48);
    const ids = Array.isArray(m.ids) ? m.ids.filter(x => typeof x === 'string').slice(0, 20) : [];
    const myIx = rank.findIndex(x => x[0] === G.me);
    if (C.m === 'duel' && rank.length === 2 && myIx >= 0) {
      const me = rank[myIx], op = rank[1 - myIx], res = me[2] > op[2] ? 1 : me[2] < op[2] ? 0 : me[3] < op[3] ? 1 : me[3] > op[3] ? 0 : .5;
      const dr = lsElo(G.sv.rating, Math.max(100, Math.min(4000, +op[5] || 1000)), res, 32);
      G.sv.rating = Math.max(100, G.sv.rating + dr);
      if (res === 1) G.sv.duel.w++; else if (res === 0) G.sv.duel.l++; else G.sv.duel.d++;
      lsSave(G);
      if (res === 1) G.snd.win(); else G.snd.lose();
      const opP = C.pl.find(p => p.id === op[0]);
      lsDuelResults(G, { me: me[2], op: op[2], res, dr, opName: String(op[1] || 'Player'), myRes: C.res, opRes: (opP && opP.hist) || [], ids, again: G.role === 'host' ? 'online' : '', online: true });
      if (G.role !== 'host') G.$pane.querySelector('.ls-box').insertAdjacentHTML('beforeend', `<p class="ls-note">${lsEsc(T('Waiting for the host…'))}</p>`);
      return;
    }
    G.sv.rooms.p++;
    if (myIx === 0) G.sv.rooms.w++;
    lsSave(G);
    if (myIx === 0) G.snd.win(); else G.snd.fanfare();
    lsRoomResults(G, rank, ids);
  }
}
function lsRoomResults(G, rank, ids) {
  const C = G.C;
  G.rerender = () => lsRoomResults(G, rank, ids);
  const rows = rank.map((x, i) => `<div class="ls-pl${x[0] === G.me ? ' me' : ''}" style="animation-delay:${Math.min(i, 12) * .07}s"><span class="av" style="background:${i === 0 ? '#ffd447' : i === 1 ? '#c9d3e6' : i === 2 ? '#e0a060' : 'rgba(255,255,255,.14)'};color:#0b1130">${i + 1}</span><div class="nm"><b>${lsEsc(x[1])}</b><span>${lsEsc(lsKm(+x[2] || 0))}${x[6] ? ' · ' + lsEsc(T('Left')) : ''}</span></div><span></span><div class="pt"></div><div class="tot">${lsFmt(+x[2] || 0)}</div></div>`).join('');
  const items = ids.map((id, i) => { const c = C && C.res[i]; return c ? { id, k: c.k, pts: c.pts, t: c.t, sh: c.sh } : { id, k: '', pts: 0, t: -1 }; });
  const myIx = rank.findIndex(x => x[0] === G.me);
  lsPane(G, `<div class="ls-box wide"><div class="ls-kick">${lsEsc(T('Live room'))}</div><h2>${lsEsc(myIx === 0 ? T('You win!') : myIx > 0 ? T('You finished #{n}', { n: myIx + 1 }) : T('Final standings'))}</h2>
<div style="text-align:left;margin-top:10px">${rows}</div>
${lsSheet(G, items)}
${G.role === 'host' ? `<button class="ls-btn hot" type="button" data-act="again" data-focus>${lsEsc(T('Back to lobby'))}</button>` : `<p class="ls-note">${lsEsc(T('Waiting for the host…'))}</p>`}
<button class="ls-btn ghost" type="button" data-act="leave">${lsEsc(T('Leave'))}</button>${lsLiveNote()}</div>`, { key: 'roomend' });
}
function lsLockRow(G) {
  const C = G.C;
  if (!C || C.phase !== 'q') return;
  G.$lk.hidden = false;
  const others = C.pl.filter(p => p.id !== G.me);
  if (C.m === 'duel' && others[0]) { const o = others[0]; G.$lk.innerHTML = `<span class="ls-opp">${lsAv(o.name, 1)}<span>${lsEsc(C.lk.has(o.id) ? T('Locked in') : T('Thinking…'))}</span></span>`; return; }
  const n = C.pl.length, k = C.pl.filter(p => C.lk.has(p.id)).length;
  G.$lk.innerHTML = (n <= 10 ? C.pl.map((p, i) => `<i class="${C.lk.has(p.id) ? 'ok' : ''}" title="${lsEsc(p.name)}">${lsEsc(p.name.replace(/^Bot\s+/, '').slice(0, 1).toUpperCase())}</i>`).join('') : '') + `<span>${lsEsc(T('{k} of {n} locked in', { k, n }))}</span>`;
}
function lsNetTick(G) {
  const C = G.C;
  if (!C || C.phase !== 'q') return;
  const left = (C.dl - performance.now()) / 1000;
  lsTimerUI(G, Math.max(0, left), C.secs);
  if (left <= 0 && !C.me && !C.wait && !C.timedOut) {
    C.timedOut = true;
    if (G.$in.value.trim()) lsNetSubmit(G, true);
    if (!C.wait) { G.$fb.textContent = T('Time’s up!'); G.$fb.className = 'ls-fb bad'; }
  }
}
function lsNetSubmit(G, auto) {
  const C = G.C;
  if (!C || C.phase !== 'q' || C.me || C.wait) return;
  if (!auto && C.timedOut) return;
  const txt = G.$in.value.trim(), m = lsMatch(C.P, txt);
  if (!m.ok) { if (!auto) lsFeedback(G, m.why); return; }
  C.wait = true;
  G.$in.value = ''; G.$in.classList.add('locked');
  lsResCard(G, C.P, m.row, null);
  G.snd.lock();
  if (G.role === 'host') lsHostAnswer(G, G.me, { t: 'a', i: C.i, s: txt });
  else { try { G.api.net.send({ t: 'a', i: C.i, s: txt.slice(0, 48) }); } catch (e) {} }
}
function lsNetPass(G) {
  const C = G.C;
  if (!C || C.phase !== 'q' || C.me || C.wait) return;
  C.timedOut = true; C.me = true;
  G.$in.value = '';
  lsResCard(G, C.P, null, -1, 0, 0, { why: 'pass' });
  G.snd.pass();
  if (G.role === 'host') lsHostPass(G, G.me, { i: C.i });
  else { try { G.api.net.send({ t: 'pass', i: C.i }); } catch (e) {} }
}
function lsHostPass(G, from, m) {
  const H = G.H;
  if (!H || H.phase !== 'q' || +m.i !== H.i) return;
  const p = H.pl.find(x => x.id === from && !x.bot);
  if (!p || p.lk) return;
  p.lk = true; p.cur = null;
  lsSend(G, { t: 'lk', i: H.i, ids: H.pl.filter(x => x.lk && !x.gone).map(x => x.id) });
}
function lsAct(G, a, el) {
  if (a !== 'sheet' && a !== 'set') G.snd.tap();
  if (a === 'daily') return lsDailyIntro(G);
  if (a === 'daily-go') return lsDailyStart(G);
  if (a === 'today') return lsDailyResults(G, lsDay());
  if (a === 'endless') return lsStartRound(G, { mode: 'endless', ids: lsRandomPrompts(30, (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0), secs: LS_SECS });
  if (a === 'room') return lsRoomMenu(G);
  if (a === 'room-go') return lsOnline(G, 'room');
  if (a === 'duel') return lsDuelMenu(G);
  if (a === 'duel-net') return lsOnline(G, 'duel');
  if (a === 'duelbot') { const lvl = Math.max(0, Math.min(3, +el.dataset.v || 0)); return lsStartRound(G, { mode: 'bot', ids: lsRandomPrompts(LS_N, (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, { solo: false }), secs: LS_DUEL_SECS, lvl }); }
  if (a === 'how') return lsHow(G);
  if (a === 'stats') return lsStats(G);
  if (a === 'menu') return lsMenu(G);
  if (a === 'share') return lsShareCard(G);
  if (a === 'share-go') return lsShareGo(G);
  if (a === 'share-copy') return lsCopy(G, G.shareTxt || '');
  if (a === 'share-save') return lsShareSave(G);
  if (a === 'share-back') { const f = G.shareBack; G.shareBack = null; return f ? f() : lsMenu(G); }
  if (a === 'sheet') return lsSheetOpen(G, el);
  if (a === 'set') { const k = el.dataset.k, v = +el.dataset.v; if (k === 'n' || k === 's' || k === 'b') { G.sv.room[k] = v; lsSave(G); G.snd.tap(); } return lsRoomMenu(G); }
  if (a === 'pass') return G.online ? lsNetPass(G) : lsMiss(G, 'pass');
  if (a === 'again') { if (G.online && G.role === 'host') return lsOnline(G, G.netKind || 'room'); return; }
  if (a === 'leave') { try { G.api.net.close(); } catch (e) {} G.ntok++; G.online = false; G.H = null; G.C = null; G.role = null; return lsMenu(G); }
}
function lsMount(root, api) {
  const G = { api, root, alive: true, snd: lsSound(api), sv: lsClean(api.load()), ntok: 0, online: false, role: null, R: null, C: null, H: null, lang: lsLang(), paneKey: '', rerender: null, port: false, SW: 960, SH: 600, scale: 1, lastSec: 0 };
  G.myName = () => { try { const p = JSON.parse(localStorage.getItem('gameplay:profile') || 'null'); if (p && (p.username || p.displayName)) return String(p.username || p.displayName).replace(/[<>&"']/g, '').slice(0, 16); } catch (e) {} return T('You'); };
  G.onlineSubmit = auto => lsNetSubmit(G, auto);
  lsBuild(G);
  root._ls = { G, prompt: lsPrompt, match: lsMatch, share: lsShare, tier: lsTier, daily: lsDaily, day: lsDay };
  lsTexts(G);
  lsFit(G, true);
  api.on(G.$form, 'submit', e => { e.preventDefault(); lsSubmit(G, false); });
  api.on(G.$in, 'input', () => {
    const R = G.R, C = G.C;
    const locked = G.online ? !!(C && (C.me || C.wait || C.phase !== 'q')) : !!(R && (R.me || R.phase !== 'ask'));
    if (locked) { G.$in.value = ''; return; }
    if (G.$fb.classList.contains('bad')) { G.$fb.textContent = ''; G.$fb.className = 'ls-fb'; }
  });
  api.on(G.$in, 'keydown', e => { if (e.key && e.key.length === 1) G.snd.key(); e.stopPropagation(); });
  api.on(G.st, 'click', e => {
    const el = e.target.closest('[data-act]');
    if (!el || !G.st.contains(el)) return;
    e.preventDefault();
    lsAct(G, el.dataset.act, el);
  });
  api.on(G.st, 'contextmenu', e => { if (e.target.closest('canvas')) e.preventDefault(); });
  api.on(window, 'keydown', e => {
    if (!G.alive || e.target === G.$in) return;
    const R = G.R;
    if (e.key === 'Enter' && R && !G.online && (R.phase === 'lock' || R.phase === 'show') && R.fin && !R.over && G.$pane.hidden) { e.preventDefault(); R.wait = Math.min(R.wait, .12); }
  });
  api.on(window, 'resize', () => lsFit(G));
  let ro = null;
  if (typeof ResizeObserver === 'function') { ro = new ResizeObserver(() => { if (G.alive) lsFit(G); }); ro.observe(root); }
  let last = performance.now(), acc = 0;
  const STEP = 1 / 120;
  api.loop(() => {
    const now = performance.now();
    let dt = (now - last) / 1000;
    last = now;
    if (dt > .25) dt = 0;
    acc = Math.min(acc + dt, .25);
    while (acc >= STEP) { G.scene.step(STEP); acc -= STEP; }
    if (!G.online) lsTick(G, dt); else lsNetTick(G);
    G.scene.draw();
  });
  api.interval(() => {
    lsHostTick(G);
    const p = !!api.paused;
    if (p !== G.paused) { G.paused = p; G.st.classList.toggle('paused', p); if (!p && !G.$q.hidden && G.$pane.hidden) G.$in.focus({ preventScroll: true }); }
    const l = lsLang();
    if (l !== G.lang) {
      G.lang = l; lsTexts(G);
      if (G.rerender && !G.$pane.hidden && G.paneKey !== 'rv') G.rerender();
      if (!G.$q.hidden) { const P = G.online ? G.C && G.C.P : G.R && G.R.P; if (P) G.$qt.textContent = lsPromptText(P); }
      lsHud(G, !G.$hud.hidden);
    }
  }, 120);
  const warm = () => api.timeout(() => { try { if (lsAllStep()) warm(); } catch (e) {} }, 25);
  api.timeout(warm, 1200);
  let kind = 'room';
  try { kind = sessionStorage.getItem(LS_NK) || 'room'; } catch (e) {}
  if (api.net.invite) lsOnline(G, kind === 'duel' ? 'duel' : 'room');
  else lsMenu(G);
  return { destroy() { G.alive = false; G.ntok++; G.R = null; G.H = null; G.C = null; G.snd.close(); if (ro) ro.disconnect(); } };
}
Ameplay.register({
  id: LS_ID,
  title: "Krillion",
  category: 'Brain',
  tint: '#3a3f9a',
  blurb: 'Name the answer nobody else thinks of. Rare answers fly your probe further.',
  get help() { return [T('Type one answer that fits the prompt, then press Enter'), T('Wrong answers cost only time: keep trying until the clock runs out'), T('The fewer players who give your answer, the more points it scores'), T('Pass skips a prompt'), T('Endless: a Long Shot answer refuels one cell')].map(lsEsc).join(' · '); },
  better: 'high',
  format: v => v + ' pts',
  width: 960,
  icon: LS_ICON,
  css: LS_CSS,
  mount: lsMount
});
})();
