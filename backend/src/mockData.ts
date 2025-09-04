import { Event, Discussion, Message } from './types';

export const mockData = {
  event: {
    id: 'evt-001',
    name: 'Johnson Wedding Reception',
    date: '2024-06-15',
    guestCount: 62,
    timeline: {
      start: '6:00 PM',
      end: '11:00 PM'
    },
    menuPackage: 'Buffet A',
    linenColor: 'white',
    venue: 'Grand Ballroom',
    contact: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com'
    }
  } as Event,

  discussions: [
    {
      id: 'disc-001',
      eventId: 'evt-001',
      title: 'Final Details - Johnson Wedding',
      messages: [
        {
          id: 'msg-001',
          author: 'Emily Chen (Event Manager)',
          timestamp: '2024-05-10T10:30:00Z',
          body: 'Hi Sarah! Just confirming the details for your upcoming reception. We have 62 guests confirmed, dinner at 6:00 PM with Buffet A, and white linens as discussed. Please let me know if you need any changes.',
          isGuest: false
        },
        {
          id: 'msg-002',
          author: 'Sarah Johnson',
          timestamp: '2024-05-10T14:15:00Z',
          body: 'Hi Emily! Actually, we just had 4 more RSVPs come in, so we\'re up to 66 guests now. Also, can we push dinner to 7:30 PM? My family is flying in and might be running late.',
          isGuest: true
        },
        {
          id: 'msg-003',
          author: 'Sarah Johnson',
          timestamp: '2024-05-10T14:20:00Z',
          body: 'Oh, and I was thinking - could we switch to red linens instead? I think it would match our flowers better.',
          isGuest: true
        },
        {
          id: 'msg-004',
          author: 'Emily Chen (Event Manager)',
          timestamp: '2024-05-10T15:00:00Z',
          body: 'Absolutely! I can make those changes. Let me update everything in our system.',
          isGuest: false
        },
        {
          id: 'msg-005',
          author: 'Sarah Johnson',
          timestamp: '2024-05-11T09:00:00Z',
          body: 'One more thing - my cousin is vegetarian. Can we switch from Buffet A to Buffet B? I saw it has more vegetarian options.',
          isGuest: true
        },
        {
          id: 'msg-006',
          author: 'Emily Chen (Event Manager)',
          timestamp: '2024-05-11T10:30:00Z',
          body: 'Of course! Buffet B is a great choice with plenty of vegetarian options. I\'ll update the menu selection.',
          isGuest: false
        }
      ] as Message[]
    },
    {
      id: 'disc-002',
      eventId: 'evt-001',
      title: 'AV Requirements',
      messages: [
        {
          id: 'msg-007',
          author: 'Emily Chen (Event Manager)',
          timestamp: '2024-05-08T11:00:00Z',
          body: 'Hi Sarah, just wanted to confirm the AV setup. We have a wireless microphone and projector ready for the speeches.',
          isGuest: false
        },
        {
          id: 'msg-008',
          author: 'Sarah Johnson',
          timestamp: '2024-05-08T13:30:00Z',
          body: 'Perfect! We\'ll need them for the best man\'s speech and the slideshow.',
          isGuest: true
        }
      ] as Message[]
    },
    {
      id: 'disc-003',
      eventId: 'evt-001',
      title: 'Cake Delivery Coordination',
      messages: [
        {
          id: 'msg-009',
          author: 'Emily Chen (Event Manager)',
          timestamp: '2024-05-12T09:00:00Z',
          body: 'The bakery confirmed they\'ll deliver the cake at 5:30 PM on the day of the event.',
          isGuest: false
        },
        {
          id: 'msg-010',
          author: 'Sarah Johnson',
          timestamp: '2024-05-12T10:15:00Z',
          body: 'Great! We\'re expecting about 70 people total if everyone shows up, but I think 66 is more realistic.',
          isGuest: true
        },
        {
          id: 'msg-011',
          author: 'Sarah Johnson',
          timestamp: '2024-05-12T10:20:00Z',
          body: 'Actually, can we use blue napkins with the red linens? I think that combination would look nice.',
          isGuest: true
        }
      ] as Message[]
    }
  ] as Discussion[]
};