import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { toast } from 'react-toastify';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
  Paper,
  useTheme,
  Chip,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SearchIcon from '@mui/icons-material/Search';
import { format } from 'date-fns';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const eventImages = {
  'Amr Diab': 'https://amrdiab.net/wp-content/uploads/2019/10/Aqaba-News.jpg',
  'Tamer hosny': 'https://cdn.sbisiali.com/news/images/0fc050ce-7b66-4cea-a6f9-eb2952347cce.jpeg',
  'Tamer Hosny': 'https://cdn.sbisiali.com/news/images/0fc050ce-7b66-4cea-a6f9-eb2952347cce.jpeg',
  'Elissa': 'https://q8hashtagat.com/wp-content/uploads/2020/05/unnamed-file-31-1110x564-1.jpg',
  'Lege-Cy': 'https://cdn-images.dzcdn.net/images/cover/21790a297543c609de952f47b937f487/0x1900-000000-80-0-0.jpg',
  'illmond': 'https://images.genius.com/f1d546c8105361c12f83c26240a1ce8d.800x800x1.png',
  'Marwan Pablo': 'https://www.milleworld.com/wp-content/uploads/2022/09/pablo.jpeg',
  'Marwan Moussa': 'https://scenenoise.com/Content/Articles/Big_image/d75ec218-4667-4572-aefc-3625529a717f.jpg',
  'TUL8TE': 'https://s1.ticketm.net/dam/a/8e9/8227ca38-191b-4470-acf7-4b9b0d94a8e9_RETINA_PORTRAIT_3_2.jpg',
  'Abyusif': 'https://scenenoise.com/Content/Articles/Big_image/c2b218af-6c7c-4ff6-8e41-01f68bfe04b7.jpg',
  'The Weeknd': 'https://variety.com/wp-content/uploads/2022/09/GettyImages-1409221667.jpg',
  'Travis Scott': 'https://english.ahram.org.eg/Media/News/2021/11/8/41_2021-637719714838548627-854.jpg',
  'Drake': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQx1ZDx-9o2zbE7AgVojA2JTMTbvrYGVZETA&s',
};

const RootContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(6),
}));

const FilterSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(5),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  position: 'sticky',
  top: theme.spacing(10),
  zIndex: 10,
  [theme.breakpoints.down('md')]: {
    position: 'static',
    top: 'auto',
    marginBottom: theme.spacing(3),
  },
}));

const EventCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[6],
  },
}));

const EventMedia = styled(CardMedia)({
  paddingTop: '56.25%', // 16:9 ratio
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
});

const EventContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
}));

const SliderImage = styled('img')(({ theme }) => ({
  display: 'block',
  width: '100%',
  height: '450px',
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.down('sm')]: {
    height: '280px',
  },
}));

const PriceChip = styled(Chip)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '0.85rem',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  textTransform: 'uppercase',
}));

const Events = () => {
  const { fetchEvents } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [filterDate, setFilterDate] = useState(null);
  const [filterLocation, setFilterLocation] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetchEvents();
        setEvents(response.data);
      } catch (error) {
        toast.error('Failed to load events');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const lowerLocation = filterLocation.toLowerCase();
    const filtered = events.filter((event) => {
      const eventDate = new Date(event.date);
      const filterDateObj = filterDate ? new Date(filterDate) : null;
      const matchSearch =
        event.title.toLowerCase().includes(lowerQuery) ||
        event.location.toLowerCase().includes(lowerQuery) ||
        (event.description && event.description.toLowerCase().includes(lowerQuery));
      const matchDate = filterDate ? eventDate.toDateString() === filterDateObj.toDateString() : true;
      const matchLocation = filterLocation ? event.location.toLowerCase().includes(lowerLocation) : true;
      return matchSearch && matchDate && matchLocation;
    });
    setFilteredEvents(filtered);
  }, [events, searchQuery, filterDate, filterLocation]);

  if (loading) {
    return (
      <RootContainer maxWidth="xl" sx={{ textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading events...
        </Typography>
      </RootContainer>
    );
  }

  const featuredEvents = filteredEvents.slice(0, 5);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <RootContainer maxWidth="xl">
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, textAlign: 'center', mb: 5 }}
        >
          Discover Events
        </Typography>

        {/* Featured Slider */}
        {featuredEvents.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              loop
            >
              {featuredEvents.map((event) => (
                <SwiperSlide key={event._id}>
                  <Box sx={{ position: 'relative' }}>
                    <SliderImage
                      src={eventImages[event.title] || event.image || 'https://via.placeholder.com/1200x450?text=Event+Image'}
                      alt={event.title}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: 'rgba(0,0,0,0.55)',
                        color: '#fff',
                        p: 3,
                        borderBottomLeftRadius: theme.shape.borderRadius,
                        borderBottomRightRadius: theme.shape.borderRadius,
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {event.title}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ opacity: 0.85 }}>
                        {event.date ? format(new Date(event.date), 'PPP p') : 'Date TBD'}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ opacity: 0.85 }}>
                        {event.location}
                      </Typography>
                    </Box>
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        )}

        {/* Filters */}
        <FilterSection elevation={4}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <DatePicker
                label="Filter by Date"
                value={filterDate}
                onChange={setFilterDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={5}>
              <TextField
                fullWidth
                label="Filter by Location"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setFilterDate(null);
                  setFilterLocation('');
                }}
                sx={{ height: '100%' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </FilterSection>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <Grid container spacing={4}>
            {filteredEvents.map((event) => (
              <Grid item key={event._id} xs={12} sm={6} md={4} lg={3}>
                <Link to={`/events/${event._id}`} style={{ textDecoration: 'none' }}>
                  <EventCard>
                    <EventMedia
                      image={eventImages[event.title] || event.image || 'https://via.placeholder.com/400x225?text=Event+Image'}
                      title={event.title}
                    />
                    <EventContent>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{ fontWeight: 600, color: 'text.primary' }}
                      >
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {event.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {event.date ? format(new Date(event.date), 'PPP p') : 'Date TBD'}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <PriceChip
                          label={`EGP ${event.Price !== undefined ? event.Price.toFixed(2) : 'Free'}`}
                        />
                      </Box>
                    </EventContent>
                  </EventCard>
                </Link>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 8 }}>
            No events found.
          </Typography>
        )}
      </RootContainer>
    </LocalizationProvider>
  );
};

export default Events;
