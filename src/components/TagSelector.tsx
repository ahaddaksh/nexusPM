import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tag as TagIcon, Search, X } from 'lucide-react';
import { Tag } from '@/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TagSelectorProps {
  tags: Tag[];
  selectedTags: string[];
  onSelectionChange: (tagIds: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function TagSelector({
  tags,
  selectedTags,
  onSelectionChange,
  label = 'Tags',
  placeholder = 'Search tags...',
}: TagSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredTags = useMemo(() => {
    if (!searchTerm.trim()) return tags;
    const searchLower = searchTerm.toLowerCase();
    return tags.filter(
      tag =>
        tag.name.toLowerCase().includes(searchLower) ||
        tag.category?.toLowerCase().includes(searchLower) ||
        tag.description?.toLowerCase().includes(searchLower)
    );
  }, [tags, searchTerm]);

  const selectedTagObjects = useMemo(() => {
    return tags.filter(tag => selectedTags.includes(tag.id));
  }, [tags, selectedTags]);

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onSelectionChange(selectedTags.filter(id => id !== tagId));
    } else {
      onSelectionChange([...selectedTags, tagId]);
    }
  };

  const handleRemoveTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(selectedTags.filter(id => id !== tagId));
  };

  // If there are few tags, show inline selector
  if (tags.length <= 8) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Button
              key={tag.id}
              type="button"
              variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTagToggle(tag.id)}
              style={
                selectedTags.includes(tag.id)
                  ? { backgroundColor: tag.color, borderColor: tag.color }
                  : {}
              }
            >
              <TagIcon className="h-3 w-3 mr-1" />
              {tag.name}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // For larger lists, use popover with search
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {/* Selected tags display */}
        {selectedTagObjects.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50 min-h-[40px]">
            {selectedTagObjects.map(tag => (
              <Badge
                key={tag.id}
                variant="default"
                className="flex items-center gap-1"
                style={{ backgroundColor: tag.color, borderColor: tag.color }}
              >
                <TagIcon className="h-3 w-3" />
                {tag.name}
                <button
                  type="button"
                  onClick={e => handleRemoveTag(tag.id, e)}
                  className="ml-1 hover:bg-black/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Tag selector popover */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
            >
              <Search className="h-4 w-4 mr-2" />
              {selectedTags.length > 0
                ? `${selectedTags.length} tag${selectedTags.length !== 1 ? 's' : ''} selected`
                : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={placeholder}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                {filteredTags.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No tags found
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredTags.map(tag => {
                      const isSelected = selectedTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleTagToggle(tag.id)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                            isSelected
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded border flex-shrink-0"
                            style={{ backgroundColor: tag.color || '#3b82f6' }}
                          />
                          <span className="flex-1">{tag.name}</span>
                          {tag.category && (
                            <span className="text-xs text-muted-foreground">
                              {tag.category}
                            </span>
                          )}
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                              <X className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
            {selectedTags.length > 0 && (
              <div className="p-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    onSelectionChange([]);
                    setSearchTerm('');
                  }}
                >
                  Clear selection
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

