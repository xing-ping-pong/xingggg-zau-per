import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin } from "lucide-react"

export function ContactSection() {
  return (
    <section id="contact" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">Enchanting Conversations</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We'd love to hear from you. Reach out for personalized fragrance consultations or any inquiries.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-foreground mb-6">Get in Touch</h3>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Our fragrance experts are here to help you discover your perfect scent. Whether you're looking for a
                signature fragrance or a special gift, we're dedicated to providing you with an exceptional experience.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="border-0 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 luxury-gradient rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Email</h4>
                      <p className="text-muted-foreground">hello@rosiaperfumes.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 luxury-gradient rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Phone</h4>
                      <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 luxury-gradient rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Address</h4>
                      <p className="text-muted-foreground">
                        123 Fragrance Avenue
                        <br />
                        New York, NY 10001
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="border-0 bg-card">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                      First Name
                    </label>
                    <Input id="firstName" placeholder="Your first name" className="bg-background border-border" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                      Last Name
                    </label>
                    <Input id="lastName" placeholder="Your last name" className="bg-background border-border" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Subject
                  </label>
                  <Input id="subject" placeholder="How can we help you?" className="bg-background border-border" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your fragrance preferences or any questions you have..."
                    rows={5}
                    className="bg-background border-border resize-none"
                  />
                </div>
                <Button className="w-full luxury-gradient text-black font-semibold py-6">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
