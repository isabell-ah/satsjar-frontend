import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Zap,
  BookOpen,
  Coins,
  MessageSquare,
  Wallet,
  Phone,
  Twitter,
  Instagram,
  Facebook,
  ArrowRight,
} from 'lucide-react';
import Logo from './Logo';

interface HomePageProps {
  onGetStarted?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  // Mock images - replace with actual imports if needed
  const child = '/assets/child.jpg';
  const btc = '/favicon.png';
  const mother = '/assets/mama.jpg';
  const mother1 = '/assets/luhyamum.jpg';
  const crypto = '/crypto.jpg';
  const lower = '/assets/lower.jpg';

  return (
    <div className='animate-fade-in space-y-6 p-4 pb-8'>
      <div className='flex justify-center mb-6'>
        {/* <Logo /> */}
        <Card className='overflow-hidden border-0 shadow-lg mb-6'>
          <div className='bg-gradient-to-br from-amber-500 to-yellow-500 p-6'>
            <CardTitle className='text-2xl text-white text-center'>
              Small satoshis. Big futures.
            </CardTitle>
            <p className='text-white/90 text-center mt-2'>(Learn, Earn Save)</p>
          </div>
          <section className='grid md:grid-cols-2 gap-12 items-center px-6 md:px-12 mb-20'>
            <div>
              <h2 className='text-4xl md:text-5xl font-serif font-bold leading-tight mb-6'>
                Raising a{' '}
                <span className='font-serif text-yellow-400'>Bitcoin</span>{' '}
                Smart Generation
              </h2>
              <p className='mb-8 font-serif text-gray-300 text-lg'>
                The world's first bitcoin-powered platform where children don't
                just learn about money — they experience it!
              </p>
              <p className='mb-8 font-serif text-gray-300 text-lg'>
                A revolutionary platform where kids grow their savings in
                bitcoin — building money habits that last a lifetime.
              </p>

              <div className='flex gap-3 justify-center'>
                <Link to='/about'>
                  <Button variant='outline'>Learn More</Button>
                </Link>
                <Button
                  className='bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
                  onClick={onGetStarted}
                >
                  Get Started
                </Button>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              {[child, btc, mother, crypto].map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  className='w-full h-56 rounded-xl object-cover hover:scale-105 transition-transform duration-300'
                  alt={`hero-img-${idx}`}
                />
              ))}
            </div>
          </section>
        </Card>
      </div>

      <Card className='overflow-hidden border-0 shadow-lg mb-6'>
        <Logo />

        <CardContent className='p-6 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex items-start space-x-3'>
              <div className='bg-amber-100 p-2 rounded-lg'>
                <BookOpen className='h-5 w-5 text-amber-600' />
              </div>
              <div>
                <h3 className='font-medium'>Learn & Earn</h3>
                <p className='text-sm text-muted-foreground'>
                  Interactive games and lessons about financial literacy
                </p>
              </div>
            </div>
            <div className='flex items-start space-x-3'>
              <div className='bg-amber-100 p-2 rounded-lg'>
                <Zap className='h-5 w-5 text-amber-600' />
              </div>
              <div>
                <h3 className='font-medium'>Bitcoin Savings</h3>
                <p className='text-sm text-muted-foreground'>
                  Secure custodial Lightning wallet for children's savings
                </p>
              </div>
            </div>
            <div className='flex items-start space-x-3'>
              <div className='bg-amber-100 p-2 rounded-lg'>
                <Coins className='h-5 w-5 text-amber-600' />
              </div>
              <div>
                <h3 className='font-medium'>M-Pesa Integration</h3>
                <p className='text-sm text-muted-foreground'>
                  Parents deposit KSh via M-Pesa, converted to Bitcoin sats
                </p>
              </div>
            </div>
            <div className='flex items-start space-x-3'>
              <div className='bg-amber-100 p-2 rounded-lg'>
                <MessageSquare className='h-5 w-5 text-amber-600' />
              </div>
              <div>
                <h3 className='font-medium'>SMS Access (Coming soon..)</h3>
                <p className='text-sm text-muted-foreground'>
                  Rural users can manage accounts via SMS messaging
                </p>
              </div>
            </div>
          </div>

          <div className='mt-6 pt-4 border-t text-center'>
            <p className='text-muted-foreground mb-4'>
              A fun, educational approach to financial literacy & Bitcoin
              savings for Kenyan families.
            </p>

            <div className='flex gap-3 justify-center'>
              <Link to='/about'>
                <Button variant='outline'>Learn More</Button>
              </Link>
              <Button
                className='bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
                onClick={onGetStarted}
              >
                Get Started
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Dashboard Card */}

      <section className='flex justify-center mb-20 px-4'>
        <div className='relative bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-2xl w-full text-black'>
          <div className="absolute inset-0 bg-[url('https://via.placeholder.com/600x400')] bg-cover bg-center rounded-2xl opacity-10 -z-10"></div>
          <h3 className='text-lg font-serif font-semibold mb-1'>Wallet</h3>
          <p className='text-2xl font-serif font-bold mb-1'>Hello Letim 👋</p>
          <p className='text-sm text-gray-700 mb-6'>Ready to start?</p>

          {/* Balance Section */}
          <div className='grid grid-cols-3 gap-4 text-center text-sm font-semibold mb-6'>
            <div className='bg-white/80 p-4 rounded-xl shadow-md'>
              <p className='text-gray-700 text-sm font-serif'>My Balance</p>
              <p className='text-m font-bold'>121.00₿</p>
            </div>
            <div className='bg-green-100 p-4 rounded-xl shadow-md'>
              <p className='text-gray-700 text-sm font-serif'>Savings</p>
              <p className='text-m text-green-600 font-bold'>+23.00₿</p>
            </div>
            <div className='bg-red-100 p-4 rounded-xl shadow-md'>
              <p className='text-gray-700 text-sm font-serif'>Account</p>
              <p className='text-m text-red-600 font-bold'>-12.00₿</p>
            </div>
          </div>

          {/* Current Balance Section */}
          <div className='mb-8 p-4 bg-amber-50 rounded-lg'>
            <h3 className='text-lg font-medium mb-2'>Current Balance</h3>
            <div className='flex justify-between items-center'>
              <div>
                <p className='text-3xl font-bold'>12,500 sats</p>
                <p className='text-sm text-muted-foreground'>≈ 150 KSh</p>
              </div>
              <div className='bg-white p-3 rounded-full shadow'>
                <Wallet className='h-8 w-8 text-amber-500' />
              </div>
            </div>
          </div>

          {/* Monthly & Spending */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-white p-5 rounded-xl shadow-sm'>
              <p className='text-sm mb-3 font-serif font-medium text-gray-700'>
                Monthly plan
              </p>
              <div className='flex justify-center items-center h-20'>
                <div className='w-16 h-16 rounded-full border-4 border-purple-600 flex items-center justify-center'>
                  <span className='text-purple-600 font-serif font-bold'>
                    75%
                  </span>
                </div>
              </div>
            </div>
            <div className='bg-white p-5 rounded-xl shadow-sm'>
              <p className='text-sm mb-3 font-serif font-medium text-gray-700'>
                Spending frequency
              </p>
              <div className='flex justify-center items-center h-20'>
                <svg width='80' height='40'>
                  <polyline
                    fill='none'
                    stroke='orange'
                    strokeWidth='2'
                    points='0,30 10,20 20,25 30,15 40,20 50,10 60,15 70,5'
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 px-6 md:px-24 text-center mb-24'>
        {[
          {
            icon: '🎮',
            title: 'Fun Learning',
            desc: 'Kids learn about bitcoin with gamified learning.',
          },
          {
            icon: '🏆',
            title: 'Challenge Rewards',
            desc: 'Get achievement and challenge rewards.',
          },
          {
            icon: '⭐',
            title: 'Saving Progress',
            desc: 'Track savings progress in real time!',
          },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className='flex font-serif text-3xl flex-col items-center'
          >
            <div className='text-5xl mb-3'>{icon}</div>
            <p className='font-semibold text-lg'>{title}</p>
            <p className='text-sm text-white'>{desc}</p>
          </div>
        ))}
      </section>

      {/* Testimonial Section */}
      <section className='px-6 md:px-12 mb-12'>
        <div className='mb-12 flex items-center justify-center'>
          <div className='bg-blue-700 rounded-xl p-6 md:p-8 max-w-xl w-full shadow-lg relative'>
            <p className='text-lg font-medium font-serif mb-4 text-white'>
              "SatsJar transforms financial education from abstract lessons into
              hands-on experience with actual bitcoin!"
            </p>
            <div className='flex items-center space-x-4'>
              <img
                src={mother}
                className='w-10 h-10 rounded-full'
                alt='Sarah Atieno'
              />
              <div>
                <p className='font-semibold text-white'>Sarah Atieno</p>
                <div className='text-yellow-400'>★★★★★</div>
              </div>
            </div>
            <div className='absolute top-0 right-0 w-20 h-20 bg-purple-800 rounded-bl-full'></div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className='px-6 md:px-12 mb-20'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500'>
            Let's Connect
          </h2>
          <p className='text-gray-300 max-w-2xl mx-auto'>
            Have questions about SatsJar? We're here to help your family start
            the Bitcoin journey.
          </p>
        </div>
        <Card className='overflow-hidden border-0 shadow-lg'>
          <CardContent className='p-0'>
            <div className='grid grid-cols-1 lg:grid-cols-5'>
              {/* Left side - Contact info */}
              <div className='p-8 md:p-10 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 lg:col-span-2 relative overflow-hidden'>
                <div className='relative z-10'>
                  <h3 className='text-2xl font-serif font-bold mb-6'>
                    Get in Touch
                  </h3>

                  <div className='space-y-8 mt-10'>
                    <div className='flex items-center gap-4 group'>
                      <div className='bg-amber-100 p-3 rounded-lg group-hover:bg-amber-200 transition-all duration-300'>
                        <Phone className='h-5 w-5 text-amber-600' />
                      </div>
                      <div>
                        <p className='font-medium'>Phone</p>
                        <p className='text-muted-foreground font-serif'>
                          +254 748 232 218
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-4 group'>
                      <div className='bg-amber-100 p-3 rounded-lg group-hover:bg-amber-200 transition-all duration-300'>
                        <MessageSquare className='h-5 w-5 text-amber-600' />
                      </div>
                      <div>
                        <p className='font-medium'>Email</p>
                        <p className='text-muted-foreground font-serif'>
                          satsjar@gmail.com
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-4 group'>
                      <div className='bg-amber-100 p-3 rounded-lg group-hover:bg-amber-200 transition-all duration-300'>
                        <ArrowRight className='h-5 w-5 text-amber-600' />
                      </div>
                      <div>
                        <p className='font-medium'>Location</p>
                        <p className='text-muted-foreground font-serif'>
                          Nairobi, Kenya
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='mt-12 flex space-x-4'>
                    <a
                      href='#'
                      className='bg-amber-100 p-3 rounded-full hover:bg-amber-200 transition-all duration-300'
                    >
                      <Facebook className='h-5 w-5 text-amber-600' />
                    </a>
                    <a
                      href='#'
                      className='bg-amber-100 p-3 rounded-full hover:bg-amber-200 transition-all duration-300'
                    >
                      <Twitter className='h-5 w-5 text-amber-600' />
                    </a>
                    <a
                      href='#'
                      className='bg-amber-100 p-3 rounded-full hover:bg-amber-200 transition-all duration-300'
                    >
                      <Instagram className='h-5 w-5 text-amber-600' />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right side - Contact form */}
              <div className='p-8 md:p-10 lg:col-span-3'>
                <form className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Your Name</label>
                      <div className='relative'>
                        <input
                          type='text'
                          className='w-full border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all duration-300'
                          placeholder='Maria Salama'
                        />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Your Email</label>
                      <div className='relative'>
                        <input
                          type='email'
                          className='w-full border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all duration-300'
                          placeholder='maria@example.com'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Subject</label>
                    <div className='relative'>
                      <input
                        type='text'
                        className='w-full border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all duration-300'
                        placeholder='How can we help you?'
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Your Message</label>
                    <div className='relative'>
                      <textarea
                        rows={5}
                        className='w-full border border-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent transition-all duration-300 resize-none'
                        placeholder='Tell us more about your inquiry...'
                      ></textarea>
                    </div>
                  </div>

                  <div className='pt-2'>
                    <Button className='w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-medium py-3 px-4 rounded-lg'>
                      Send Message
                    </Button>
                    <p className='text-xs text-muted-foreground mt-3 text-center font-serif'>
                      We'll get back to you within 24 hours
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default HomePage;
