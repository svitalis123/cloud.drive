'use client'
import React, { useState } from 'react';
import { Upload, Wand2, Crop, Layout, Image as ImageIcon, Play, X, ChevronUp, ChevronDown, LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Feature {
  title: string;
  icon: LucideIcon;
  description: string;
  span?: boolean;
}

interface FeatureCardProps extends Feature {}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, icon: Icon, description }) => (
  <Card className="bg-accent hover:bg-accent/80 transition-colors duration-200 cursor-pointer">
    <CardHeader>
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Icon className="text-primary" size={24} />
        {title}
      </h2>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const PhotoAppHome: React.FC = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(true);

  const features: Feature[] = [
    {
      title: "Upload Photos",
      icon: Upload,
      description: "From web, camera, drive, Dropbox, Shutterstock, Getty Images",
      span: true
    },
    {
      title: "AI Magic",
      icon: Wand2,
      description: "Enhance, restore, remove backgrounds with AI"
    },
    {
      title: "Transform",
      icon: Crop,
      description: "Crop, resize to square, landscape, or portrait"
    },
    {
      title: "Filters",
      icon: ImageIcon,
      description: "Apply trendy filters to your photos"
    },
    {
      title: "Collage",
      icon: Layout,
      description: "Create stunning collages with up to 4 photos"
    }
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto bg-background text-foreground">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Welcome to PhotoPro</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSectionVisible(!isSectionVisible)}
          className="flex items-center gap-2"
        >
          {isSectionVisible ? (
            <>
              Hide Features <ChevronUp size={16} />
            </>
          ) : (
            <>
              Show Features <ChevronDown size={16} />
            </>
          )}
        </Button>
      </div>
      
      {isSectionVisible && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {features.map((feature, index) => (
              <div key={feature.title} className={feature.span ? "col-span-1 md:col-span-2" : ""}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
          
          <Button 
            className="w-full mb-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setIsVideoOpen(true)}
          >
            <Play className="mr-2" size={20} />
            Watch Demo Video
          </Button>
        </>
      )}
      
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Get Started with PhotoPro</DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            <iframe
              src="https://www.loom.com/embed/e6ded5424d6e41759ebfcee60f763f78?sid=0152a566-2e97-492c-9b74-1a8333e52ea7"
              frameBorder="0"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoAppHome;