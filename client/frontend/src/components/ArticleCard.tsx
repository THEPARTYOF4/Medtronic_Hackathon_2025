import { Card, CardHeader, CardContent } from "@/components/ui/card";
import React from "react";

interface ArticleCardProps {
  image: string;
  title: string;
  summary: string;
  tags: string[];
  source: string;
  url: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ image, title, summary, tags, source, url }) => (
  <a href={url} target="_blank" rel="noopener noreferrer" className="block">
    <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
      <CardHeader className="p-0">
        <img src={image} alt={title} className="w-full h-40 object-cover rounded-t" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col ">
        <div className="font-bold text-lg mb-1">{title}</div>
        <div className="text-sm text-muted-foreground mb-2 overflow-hidden" style={{display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical'}}>
          {summary}
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-gray-200 rounded text-xs">{tag}</span>
          ))}
          <span className="px-2 py-1 bg-gray-200 rounded text-xs">{source}</span>
        </div>
        <span className="text-primary underline text-sm mt-auto">Read Full Article</span>
      </CardContent>
    </Card>
  </a>
);
