import React, { useMemo, useState } from 'react';
import {
  Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput,
  TouchableOpacity, View, KeyboardAvoidingView, Platform
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

type Tab = 'Home' | 'Doctors' | 'Appointments' | 'Chat' | 'Profile';
type Doctor = { id: number; name: string; specialty: string; rating: string; experience: string; price: string; initials: string; color: string; available: string };

const C = {
  navy: '#153B50', blue: '#2789A6', aqua: '#DDF3F5', pale: '#F3F9FA',
  white: '#FFFFFF', text: '#203744', muted: '#82939C', line: '#E5EEF0',
  green: '#35A985', orange: '#F2A65A', red: '#D96B6B'
};

const doctors: Doctor[] = [
  { id: 1, name: 'Dr. Amina Sadykova', specialty: 'Clinical Dermatologist', rating: '4.9', experience: '12 years', price: '₸12 000', initials: 'AS', color: '#DDF1EB', available: 'Today, 14:30' },
  { id: 2, name: 'Dr. Daniel Kim', specialty: 'Cosmetic Dermatologist', rating: '4.8', experience: '9 years', price: '₸15 000', initials: 'DK', color: '#E8E7FA', available: 'Today, 16:00' },
  { id: 3, name: 'Dr. Madina Omarova', specialty: 'Pediatric Dermatologist', rating: '5.0', experience: '15 years', price: '₸10 000', initials: 'MO', color: '#FCEBD9', available: 'Tomorrow, 10:00' }
];

const services = [
  { icon: 'scan-outline' as const, title: 'Skin analysis', subtitle: 'Understand your skin', color: '#DDF3F5' },
  { icon: 'calendar-outline' as const, title: 'Consultation', subtitle: 'Book a dermatologist', color: '#E9E8FA' },
  { icon: 'chatbubble-ellipses-outline' as const, title: 'Ask a doctor', subtitle: 'Get expert guidance', color: '#FCEBD9' }
];

function Button({ title, onPress, secondary = false }: { title: string; onPress: () => void; secondary?: boolean }) {
  return <TouchableOpacity onPress={onPress} style={[styles.button, secondary && styles.buttonSecondary]} activeOpacity={0.85}>
    <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{title}</Text>
  </TouchableOpacity>;
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={styles.header}><View><Text style={styles.headerTitle}>{title}</Text>{subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}</View>
    <View style={styles.headerIcon}><Ionicons name="notifications-outline" size={21} color={C.navy} /></View>
  </View>;
}

function DoctorCard({ doctor, onBook, onDetails }: { doctor: Doctor; onBook: () => void; onDetails: () => void }) {
  return <View style={styles.doctorCard}>
    <TouchableOpacity style={styles.doctorTop} onPress={onDetails} activeOpacity={0.8}>
      <View style={[styles.avatar, { backgroundColor: doctor.color }]}><Text style={styles.avatarText}>{doctor.initials}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.doctorName}>{doctor.name}</Text>
        <Text style={styles.muted}>{doctor.specialty}</Text>
        <View style={styles.ratingRow}><Ionicons name="star" size={13} color="#F2B544" /><Text style={styles.rating}>{doctor.rating}</Text><Text style={styles.muted}> · {doctor.experience}</Text></View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.muted} />
    </TouchableOpacity>
    <View style={styles.cardDivider} />
    <View style={styles.doctorBottom}><View><Text style={styles.muted}>Consultation fee</Text><Text style={styles.price}>{doctor.price}</Text></View><Button title="Book now" onPress={onBook} /></View>
  </View>;
}

export default function App() {
  const [tab, setTab] = useState<Tab>('Home');
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookings, setBookings] = useState<{ doctor: string; date: string; time: string; status: string }[]>([
    { doctor: 'Dr. Amina Sadykova', date: 'Nov 05, 2026', time: '14:30', status: 'Confirmed' }
  ]);
  const [chatText, setChatText] = useState('');
  const [messages, setMessages] = useState([{ from: 'doctor', text: 'Hello! I’m Dr. Amina. How can I help you with your skin today?' }]);
  const [profileName, setProfileName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex.morgan@email.com');
  const [loggedIn, setLoggedIn] = useState(true);
  const [diagnosisOpen, setDiagnosisOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('Nov 06, 2026');
  const [bookingTime, setBookingTime] = useState('10:00');

  const filteredDoctors = useMemo(() => doctors.filter(d => (d.name + d.specialty).toLowerCase().includes(search.toLowerCase())), [search]);

  const book = (doctor: Doctor) => { setBookingDoctor(doctor); setBookingDate('Nov 06, 2026'); setBookingTime('10:00'); };
  const confirmBooking = () => {
    if (!bookingDoctor) return;
    setBookings(prev => [{ doctor: bookingDoctor.name, date: bookingDate, time: bookingTime, status: 'Confirmed' }, ...prev]);
    setBookingDoctor(null); setTab('Appointments');
    Alert.alert('Booking confirmed', 'Your appointment has been added to My Appointments.');
  };
  const sendMessage = () => {
    if (!chatText.trim()) return;
    setMessages(prev => [...prev, { from: 'you', text: chatText.trim() }, { from: 'doctor', text: 'Thank you for your message. A doctor will respond shortly.' }]);
    setChatText('');
  };

  const navItems: { key: Tab; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { key: 'Home', icon: 'home-outline', label: 'Home' },
    { key: 'Doctors', icon: 'people-outline', label: 'Doctors' },
    { key: 'Appointments', icon: 'calendar-outline', label: 'Visits' },
    { key: 'Chat', icon: 'chatbubble-ellipses-outline', label: 'Chat' },
    { key: 'Profile', icon: 'person-outline', label: 'Profile' }
  ];

  const content = () => {
    if (bookingDoctor) return <ScrollView contentContainerStyle={styles.page}>
      <TouchableOpacity style={styles.back} onPress={() => setBookingDoctor(null)}><Ionicons name="arrow-back" size={20} color={C.navy} /><Text style={styles.backText}>Back</Text></TouchableOpacity>
      <Text style={styles.pageTitle}>Book appointment</Text><Text style={styles.pageSubtitle}>Choose a convenient date and time.</Text>
      <DoctorCard doctor={bookingDoctor} onBook={() => {}} onDetails={() => {}} />
      <Text style={styles.sectionTitle}>Select date</Text>
      <View style={styles.choiceRow}>{['Nov 06, 2026', 'Nov 07, 2026', 'Nov 08, 2026'].map(d => <TouchableOpacity key={d} onPress={() => setBookingDate(d)} style={[styles.choice, bookingDate === d && styles.choiceActive]}><Text style={[styles.choiceText, bookingDate === d && styles.choiceTextActive]}>{d.split(',')[0]}</Text><Text style={[styles.choiceSmall, bookingDate === d && styles.choiceTextActive]}>{d.split(' ')[1].replace(',', '')}</Text></TouchableOpacity>)}</View>
      <Text style={styles.sectionTitle}>Available time</Text>
      <View style={styles.timeGrid}>{['09:00', '10:00', '11:30', '14:30', '16:00', '17:30'].map(t => <TouchableOpacity key={t} onPress={() => setBookingTime(t)} style={[styles.timeChip, bookingTime === t && styles.timeChipActive]}><Text style={[styles.timeText, bookingTime === t && styles.timeTextActive]}>{t}</Text></TouchableOpacity>)}</View>
      <View style={styles.infoBox}><Ionicons name="information-circle-outline" size={19} color={C.blue} /><Text style={styles.infoText}>You can cancel or reschedule your appointment from the Visits tab.</Text></View>
      <Button title="Confirm appointment" onPress={confirmBooking} />
    </ScrollView>;

    if (selectedDoctor) return <ScrollView contentContainerStyle={styles.page}>
      <TouchableOpacity style={styles.back} onPress={() => setSelectedDoctor(null)}><Ionicons name="arrow-back" size={20} color={C.navy} /><Text style={styles.backText}>Back to doctors</Text></TouchableOpacity>
      <View style={styles.profileDoctorHero}><View style={[styles.avatarLarge, { backgroundColor: selectedDoctor.color }]}><Text style={styles.avatarLargeText}>{selectedDoctor.initials}</Text></View><Text style={styles.doctorNameLarge}>{selectedDoctor.name}</Text><Text style={styles.muted}>{selectedDoctor.specialty}</Text><Text style={styles.ratingRowText}>⭐ {selectedDoctor.rating} · {selectedDoctor.experience} experience</Text></View>
      <Text style={styles.sectionTitle}>About doctor</Text><Text style={styles.bodyText}>Experienced dermatologist focused on evidence-based skin care, diagnosis and personalized treatment plans. Provides consultations for acne, eczema, skin irritation and general dermatological concerns.</Text>
      <Text style={styles.sectionTitle}>Services</Text>{['General skin consultation', 'Acne and rosacea care', 'Eczema assessment', 'Mole and skin check'].map(x => <View key={x} style={styles.listLine}><Ionicons name="checkmark-circle" color={C.green} size={18} /><Text style={styles.bodyText}>{x}</Text></View>)}
      <View style={styles.infoBox}><Ionicons name="time-outline" color={C.blue} size={19} /><Text style={styles.infoText}>Next available: {selectedDoctor.available}</Text></View>
      <Button title={`Book for ${selectedDoctor.price}`} onPress={() => { const d = selectedDoctor; setSelectedDoctor(null); book(d); }} />
    </ScrollView>;

    switch (tab) {
      case 'Home': return <ScrollView contentContainerStyle={styles.page}>
        <Header title="Good morning, Alex 👋" subtitle="Your skin health, made simple" />
        <View style={styles.hero}><View style={{ flex: 1 }}><Text style={styles.heroEyebrow}>DERMACARE HEALTH</Text><Text style={styles.heroTitle}>Healthy skin starts with care.</Text><Text style={styles.heroDesc}>Expert dermatology support, wherever you are.</Text><TouchableOpacity onPress={() => setTab('Doctors')} style={styles.heroButton}><Text style={styles.heroButtonText}>Find a doctor</Text><Ionicons name="arrow-forward" size={16} color={C.navy} /></TouchableOpacity></View><View style={styles.heroArt}><Text style={{ fontSize: 48 }}>🩺</Text><View style={styles.heroBubble}><Ionicons name="heart" color={C.white} size={15} /></View></View></View>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Explore services</Text><Text style={styles.link} onPress={() => setDiagnosisOpen(true)}>See all</Text></View>
        {services.map((s, i) => <TouchableOpacity key={s.title} style={styles.serviceCard} onPress={() => i === 0 ? setDiagnosisOpen(true) : i === 1 ? setTab('Appointments') : setTab('Chat')}>
          <View style={[styles.serviceIcon, { backgroundColor: s.color }]}><Ionicons name={s.icon} size={23} color={C.blue} /></View><View style={{ flex: 1 }}><Text style={styles.serviceTitle}>{s.title}</Text><Text style={styles.muted}>{s.subtitle}</Text></View><Ionicons name="chevron-forward" size={19} color={C.muted} />
        </TouchableOpacity>)}
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Top dermatologists</Text><Text style={styles.link} onPress={() => setTab('Doctors')}>View all</Text></View>
        {doctors.slice(0, 2).map(d => <DoctorCard key={d.id} doctor={d} onBook={() => book(d)} onDetails={() => setSelectedDoctor(d)} />)}
        <View style={styles.tipCard}><Text style={styles.tipTitle}>Daily skin tip ✨</Text><Text style={styles.bodyText}>Apply broad-spectrum SPF 30+ every morning, even on cloudy days.</Text></View>
      </ScrollView>;
      case 'Doctors': return <ScrollView contentContainerStyle={styles.page}><Header title="Find a doctor" subtitle="Qualified dermatologists for your needs" />
        <View style={styles.searchBox}><Ionicons name="search" size={19} color={C.muted} /><TextInput value={search} onChangeText={setSearch} placeholder="Search doctor or specialty" placeholderTextColor={C.muted} style={styles.searchInput} /></View>
        <Text style={styles.resultsLabel}>{filteredDoctors.length} specialists available</Text>
        {filteredDoctors.map(d => <DoctorCard key={d.id} doctor={d} onBook={() => book(d)} onDetails={() => setSelectedDoctor(d)} />)}
        {filteredDoctors.length === 0 && <Text style={styles.emptyText}>No doctors found. Try another search.</Text>}
      </ScrollView>;
      case 'Appointments': return <ScrollView contentContainerStyle={styles.page}><Header title="My appointments" subtitle="Manage your upcoming visits" />
        <View style={styles.appointmentBanner}><Ionicons name="calendar" color={C.white} size={25} /><View style={{ flex: 1 }}><Text style={styles.bannerTitle}>{bookings.length} appointment{bookings.length === 1 ? '' : 's'}</Text><Text style={styles.bannerSub}>Keep your skin health on track</Text></View></View>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        {bookings.map((b, i) => <View key={i} style={styles.bookingCard}><View style={styles.bookingDate}><Text style={styles.bookingDay}>{b.date.split(' ')[1]?.replace(',', '') || '06'}</Text><Text style={styles.bookingMonth}>{b.date.split(' ')[0]}</Text></View><View style={{ flex: 1 }}><Text style={styles.doctorName}>{b.doctor}</Text><Text style={styles.muted}>{b.date} · {b.time}</Text><View style={styles.status}><View style={styles.statusDot} /><Text style={styles.statusText}>{b.status}</Text></View></View><TouchableOpacity onPress={() => Alert.alert('Appointment options', 'Contact the clinic to reschedule or cancel this appointment.')}><Ionicons name="ellipsis-vertical" size={19} color={C.muted} /></TouchableOpacity></View>)}
        <Button title="Book a new appointment" onPress={() => setTab('Doctors')} />
      </ScrollView>;
      case 'Chat': return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.page}><Header title="Messages" subtitle="Your care team is here to help" />
        <View style={styles.chatDoctor}><View style={[styles.avatar, { backgroundColor: '#DDF1EB' }]}><Text style={styles.avatarText}>AS</Text></View><View style={{ flex: 1 }}><Text style={styles.doctorName}>Dr. Amina Sadykova</Text><Text style={styles.online}><View style={styles.onlineDot} /> Online · Dermatologist</Text></View><Ionicons name="call-outline" color={C.blue} size={21} /></View>
        <ScrollView style={styles.chatArea} contentContainerStyle={{ paddingVertical: 12, gap: 12 }}>{messages.map((m, i) => <View key={i} style={[styles.messageBubble, m.from === 'you' ? styles.myMessage : styles.theirMessage]}><Text style={[styles.messageText, m.from === 'you' && { color: C.white }]}>{m.text}</Text></View>)}</ScrollView>
        <View style={styles.chatInputRow}><TextInput value={chatText} onChangeText={setChatText} placeholder="Write a message..." style={styles.chatInput} /><TouchableOpacity style={styles.sendButton} onPress={sendMessage}><Ionicons name="send" size={18} color={C.white} /></TouchableOpacity></View>
      </View></KeyboardAvoidingView>;
      case 'Profile': return <ScrollView contentContainerStyle={styles.page}><Header title="My profile" subtitle="Your personal health space" />
        <View style={styles.profileHero}><View style={styles.avatarLarge}><Text style={styles.avatarLargeText}>AM</Text></View><Text style={styles.doctorNameLarge}>{profileName}</Text><Text style={styles.muted}>{email}</Text><View style={styles.memberTag}><Text style={styles.memberTagText}>DERMACARE MEMBER</Text></View></View>
        <Text style={styles.sectionTitle}>Personal information</Text><Text style={styles.fieldLabel}>Full name</Text><TextInput style={styles.formInput} value={profileName} onChangeText={setProfileName} /><Text style={styles.fieldLabel}>Email address</Text><TextInput style={styles.formInput} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        {['Medical history', 'Notifications', 'Privacy & security', 'Help & support'].map((x, i) => <TouchableOpacity key={x} style={styles.settingsRow} onPress={() => Alert.alert(x, i === 0 ? 'Your medical records and visit history will appear here.' : 'This section is available in the app settings.') }><Ionicons name={(['document-text-outline', 'notifications-outline', 'shield-checkmark-outline', 'help-circle-outline'] as const)[i]} size={20} color={C.blue} /><Text style={styles.settingsText}>{x}</Text><Ionicons name="chevron-forward" color={C.muted} size={18} /></TouchableOpacity>)}
        <Button title={loggedIn ? 'Sign out' : 'Sign in'} secondary onPress={() => { setLoggedIn(!loggedIn); Alert.alert(loggedIn ? 'Signed out' : 'Welcome back', loggedIn ? 'You have signed out on this device.' : 'You are signed in to the demo profile.'); }} />
      </ScrollView>;
    }
  };

  return <SafeAreaView style={styles.safe}><ExpoStatusBar style="dark" /><StatusBar barStyle="dark-content" backgroundColor={C.pale} />
    <View style={styles.appBody}>{content()}</View>
    {!bookingDoctor && !selectedDoctor && <View style={styles.tabBar}>{navItems.map(n => <TouchableOpacity key={n.key} onPress={() => setTab(n.key)} style={styles.tabItem}><Ionicons name={n.icon} size={21} color={tab === n.key ? C.blue : C.muted} /><Text style={[styles.tabLabel, tab === n.key && styles.tabLabelActive]}>{n.label}</Text>{tab === n.key && <View style={styles.tabIndicator} />}</TouchableOpacity>)}</View>}
    {diagnosisOpen && <View style={styles.modalBackdrop}><View style={styles.modalCard}><TouchableOpacity style={styles.modalClose} onPress={() => setDiagnosisOpen(false)}><Ionicons name="close" size={22} color={C.navy} /></TouchableOpacity><View style={styles.modalIcon}><Ionicons name="scan-outline" size={30} color={C.blue} /></View><Text style={styles.modalTitle}>Skin health check</Text><Text style={styles.bodyText}>Select the concern that best describes your skin. This guide provides general information and does not diagnose medical conditions.</Text>
      {['Acne or breakouts', 'Dryness or irritation', 'Rash or redness', 'Moles or skin spots'].map(x => <TouchableOpacity key={x} style={styles.concernRow} onPress={() => { setDiagnosisOpen(false); Alert.alert(x, 'Please consult a qualified dermatologist for an accurate assessment. If symptoms are severe or rapidly worsening, seek medical care.'); }}><Text style={styles.bodyText}>{x}</Text><Ionicons name="chevron-forward" color={C.muted} size={18} /></TouchableOpacity>)}
      <Text style={styles.disclaimer}>Not a substitute for professional medical advice.</Text></View></View>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.pale }, appBody: { flex: 1 }, page: { padding: 20, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, marginTop: 6 },
  headerTitle: { color: C.navy, fontSize: 25, fontWeight: '800' }, headerSubtitle: { color: C.muted, fontSize: 13, marginTop: 5 },
  headerIcon: { height: 42, width: 42, borderRadius: 15, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  hero: { backgroundColor: '#DDF2F4', borderRadius: 24, padding: 20, flexDirection: 'row', minHeight: 185, overflow: 'hidden', marginBottom: 24 },
  heroEyebrow: { color: C.blue, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }, heroTitle: { color: C.navy, fontSize: 22, fontWeight: '800', lineHeight: 28, marginTop: 9, maxWidth: 205 },
  heroDesc: { color: '#52717E', fontSize: 12, lineHeight: 18, marginTop: 7, maxWidth: 190 },
  heroButton: { backgroundColor: C.white, alignSelf: 'flex-start', paddingHorizontal: 13, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 14 },
  heroButtonText: { color: C.navy, fontSize: 12, fontWeight: '700' }, heroArt: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  heroBubble: { backgroundColor: C.green, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', position: 'absolute', right: 3, bottom: 29 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 3 },
  sectionTitle: { color: C.navy, fontSize: 17, fontWeight: '800', marginTop: 16, marginBottom: 12 }, link: { color: C.blue, fontWeight: '700', fontSize: 12 },
  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 17, padding: 13, marginBottom: 10, gap: 13 },
  serviceIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  serviceTitle: { color: C.text, fontSize: 14, fontWeight: '700', marginBottom: 4 }, muted: { color: C.muted, fontSize: 11 },
  doctorCard: { backgroundColor: C.white, padding: 14, borderRadius: 18, marginBottom: 12 },
  doctorTop: { flexDirection: 'row', alignItems: 'center', gap: 12 }, avatar: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.navy, fontSize: 16, fontWeight: '800' }, doctorName: { color: C.text, fontSize: 13, fontWeight: '800', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 }, rating: { color: C.text, fontSize: 11, fontWeight: '700', marginLeft: 4 },
  cardDivider: { height: 1, backgroundColor: C.line, marginVertical: 12 }, doctorBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: C.navy, fontWeight: '800', fontSize: 14, marginTop: 3 }, button: { backgroundColor: C.blue, paddingHorizontal: 17, paddingVertical: 11, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: C.white, fontSize: 12, fontWeight: '800' }, buttonSecondary: { backgroundColor: C.aqua, marginTop: 18 }, buttonTextSecondary: { color: C.navy },
  tipCard: { backgroundColor: '#FFF4E8', borderRadius: 17, padding: 16, marginTop: 8 }, tipTitle: { color: '#A66D2D', fontWeight: '800', marginBottom: 7, fontSize: 14 },
  searchBox: { flexDirection: 'row', backgroundColor: C.white, borderRadius: 14, alignItems: 'center', paddingHorizontal: 14, marginBottom: 16, height: 49, gap: 9 },
  searchInput: { flex: 1, color: C.text, fontSize: 13 }, resultsLabel: { color: C.muted, fontSize: 12, marginBottom: 12 },
  emptyText: { color: C.muted, textAlign: 'center', marginTop: 30 }, tabBar: { height: 68, flexDirection: 'row', backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.line, justifyContent: 'space-around', paddingTop: 8 },
  tabItem: { flex: 1, alignItems: 'center', gap: 3 }, tabLabel: { color: C.muted, fontSize: 10, fontWeight: '600' }, tabLabelActive: { color: C.blue, fontWeight: '800' },
  tabIndicator: { height: 3, width: 17, borderRadius: 3, backgroundColor: C.blue, marginTop: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 17 }, backText: { color: C.navy, fontWeight: '700', fontSize: 13 },
  pageTitle: { color: C.navy, fontSize: 25, fontWeight: '800' }, pageSubtitle: { color: C.muted, fontSize: 13, marginTop: 5, marginBottom: 18 },
  choiceRow: { flexDirection: 'row', gap: 8 }, choice: { flex: 1, backgroundColor: C.white, borderRadius: 13, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: C.line },
  choiceActive: { backgroundColor: C.blue, borderColor: C.blue }, choiceText: { color: C.text, fontWeight: '700', fontSize: 11 }, choiceSmall: { color: C.muted, fontSize: 10, marginTop: 4 },
  choiceTextActive: { color: C.white }, timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, timeChip: { width: '30%', borderWidth: 1, borderColor: C.line, borderRadius: 11, paddingVertical: 12, alignItems: 'center', backgroundColor: C.white },
  timeChipActive: { backgroundColor: C.aqua, borderColor: C.blue }, timeText: { color: C.text, fontSize: 12, fontWeight: '700' }, timeTextActive: { color: C.blue },
  infoBox: { flexDirection: 'row', gap: 9, alignItems: 'center', backgroundColor: C.aqua, padding: 13, borderRadius: 13, marginVertical: 18 },
  infoText: { color: '#52717E', fontSize: 11, flex: 1, lineHeight: 16 }, appointmentBanner: { backgroundColor: C.blue, padding: 18, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  bannerTitle: { color: C.white, fontSize: 17, fontWeight: '800' }, bannerSub: { color: '#D8F0F4', fontSize: 11, marginTop: 4 },
  bookingCard: { backgroundColor: C.white, borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  bookingDate: { backgroundColor: C.aqua, borderRadius: 13, width: 54, height: 58, alignItems: 'center', justifyContent: 'center' }, bookingDay: { color: C.navy, fontSize: 18, fontWeight: '800' }, bookingMonth: { color: C.blue, fontSize: 10, fontWeight: '700' },
  status: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 }, statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green }, statusText: { color: C.green, fontSize: 10, fontWeight: '700' },
  chatDoctor: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, backgroundColor: C.white, borderRadius: 16 }, online: { color: C.green, fontSize: 10, marginTop: 4 }, onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  chatArea: { flex: 1, marginTop: 10 }, messageBubble: { maxWidth: '82%', padding: 13, borderRadius: 16 }, myMessage: { alignSelf: 'flex-end', backgroundColor: C.blue, borderBottomRightRadius: 4 }, theirMessage: { alignSelf: 'flex-start', backgroundColor: C.white, borderBottomLeftRadius: 4 },
  messageText: { color: C.text, fontSize: 13, lineHeight: 19 }, chatInputRow: { flexDirection: 'row', gap: 8, paddingTop: 10, paddingBottom: 8 }, chatInput: { flex: 1, backgroundColor: C.white, borderRadius: 13, paddingHorizontal: 14, height: 47, color: C.text, fontSize: 13 },
  sendButton: { width: 47, height: 47, borderRadius: 14, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  profileHero: { alignItems: 'center', backgroundColor: C.white, borderRadius: 20, padding: 22, marginBottom: 8 }, avatarLarge: { width: 76, height: 76, borderRadius: 25, backgroundColor: C.aqua, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarLargeText: { color: C.navy, fontSize: 23, fontWeight: '800' }, doctorNameLarge: { color: C.navy, fontSize: 18, fontWeight: '800', marginBottom: 4 }, memberTag: { backgroundColor: C.aqua, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginTop: 10 },
  memberTagText: { color: C.blue, fontSize: 9, fontWeight: '800', letterSpacing: 1 }, fieldLabel: { color: C.muted, fontSize: 11, fontWeight: '700', marginBottom: 6, marginTop: 8 },
  formInput: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingHorizontal: 13, height: 46, color: C.text, fontSize: 13 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, padding: 15, borderRadius: 13, marginTop: 8 }, settingsText: { flex: 1, color: C.text, fontWeight: '600', fontSize: 13 },
  profileDoctorHero: { alignItems: 'center', backgroundColor: C.white, borderRadius: 20, padding: 23 }, ratingRowText: { color: C.text, fontSize: 12, marginTop: 9 },
  bodyText: { color: '#607681', fontSize: 13, lineHeight: 20 }, listLine: { flexDirection: 'row', gap: 9, alignItems: 'center', marginBottom: 9 },
  modalBackdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(13,39,51,0.42)', justifyContent: 'center', padding: 22 },
  modalCard: { backgroundColor: C.white, borderRadius: 23, padding: 21 }, modalClose: { alignSelf: 'flex-end' }, modalIcon: { backgroundColor: C.aqua, width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  modalTitle: { color: C.navy, fontSize: 20, fontWeight: '800', marginBottom: 8 }, concernRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.line },
  disclaimer: { color: C.muted, fontSize: 10, marginTop: 15, fontStyle: 'italic' }
});
